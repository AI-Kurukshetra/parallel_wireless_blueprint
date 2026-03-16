"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getTenantContext } from "@/lib/auth/access";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";
import type { InvoiceWorkflowStatus } from "@/types/domain";

type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];
type InvoiceUpdate = Database["public"]["Tables"]["invoices"]["Update"];
type BillingCycleUpdate = Database["public"]["Tables"]["billing_cycles"]["Update"];
type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];
type SubscriptionUpdate = Database["public"]["Tables"]["subscriptions"]["Update"];

const subscriptionUpdateSchema = z.object({
  planId: z.string().uuid("Choose a valid plan."),
  status: z.enum(["trialing", "active", "past_due", "canceled"]),
  seats: z.coerce.number().int().min(1, "Seats must be at least 1.")
});

const invoiceStatusSchema = z.object({
  status: z.enum(["issued", "paid", "overdue", "void"])
});

function canManage(role: string) {
  return role === "owner" || role === "admin";
}

function billingUrl(path: string, params: Record<string, string>) {
  const query = new URLSearchParams(params).toString();
  return `${path}${query ? `?${query}` : ""}`;
}

async function getTenantSubscription(tenantId: string) {
  const supabase = createSupabaseAdminClient();
  const result = await supabase
    .from("subscriptions")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (result.error) throw result.error;
  return result.data as SubscriptionRow | null;
}

async function getTenantInvoice(invoiceId: string, tenantId: string) {
  const supabase = createSupabaseAdminClient();
  const result = await supabase
    .from("invoices")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("id", invoiceId)
    .maybeSingle();

  if (result.error) throw result.error;
  return result.data as InvoiceRow | null;
}

function getAllowedInvoiceTransitions(status: InvoiceWorkflowStatus): InvoiceWorkflowStatus[] {
  switch (status) {
    case "draft":
      return ["issued", "void"];
    case "issued":
      return ["paid", "overdue", "void"];
    case "overdue":
      return ["paid"];
    case "paid":
    case "void":
      return [];
  }
}

export async function updateSubscriptionAction(formData: FormData) {
  try {
    const supabase = createSupabaseAdminClient();
    const { tenant, profile } = await getTenantContext();

    if (!profile || !canManage(profile.role)) {
      redirect(billingUrl("/billing/subscription", { error: "You do not have permission to update subscriptions." }));
    }

    const parsed = subscriptionUpdateSchema.safeParse({
      planId: formData.get("planId"),
      status: formData.get("status"),
      seats: formData.get("seats")
    });

    if (!parsed.success) {
      redirect(
        billingUrl("/billing/subscription", {
          error: parsed.error.flatten().formErrors[0] ?? "Invalid subscription update request."
        })
      );
    }

    const subscription = await getTenantSubscription(tenant.id);
    if (!subscription) {
      redirect(billingUrl("/billing/subscription", { error: "No active subscription found for this tenant." }));
    }

    const planResult = await supabase
      .from("subscription_plans")
      .select("id, is_active")
      .eq("id", parsed.data.planId)
      .maybeSingle();

    if (planResult.error) {
      redirect(billingUrl("/billing/subscription", { error: planResult.error.message }));
    }

    const selectedPlan = planResult.data as { id: string; is_active: boolean } | null;

    if (!selectedPlan) {
      redirect(billingUrl("/billing/subscription", { error: "Selected plan was not found." }));
    }

    if (!selectedPlan.is_active) {
      redirect(billingUrl("/billing/subscription", { error: "Inactive plans cannot be assigned." }));
    }

    const payload: SubscriptionUpdate = {
      plan_id: parsed.data.planId,
      status: parsed.data.status,
      seats: parsed.data.seats,
      canceled_at: parsed.data.status === "canceled" ? new Date().toISOString() : null
    };

    const { error } = await supabase
      .from("subscriptions")
      .update(payload as never)
      .eq("tenant_id", tenant.id)
      .eq("id", subscription.id);

    if (error) {
      redirect(billingUrl("/billing/subscription", { error: error.message }));
    }
  } catch (error) {
    redirect(
      billingUrl("/billing/subscription", {
        error: error instanceof Error ? error.message : "Unable to update subscription."
      })
    );
  }

  revalidatePath("/billing");
  revalidatePath("/billing/subscription");
  redirect(billingUrl("/billing/subscription", { success: "Subscription updated." }));
}

export async function updateInvoiceStatusAction(invoiceId: string, formData: FormData) {
  try {
    const supabase = createSupabaseAdminClient();
    const { tenant, profile } = await getTenantContext();
    const actorProfileId = profile?.id ?? null;

    if (!profile || !canManage(profile.role)) {
      redirect(billingUrl(`/billing/invoices/${invoiceId}`, { error: "You do not have permission to update invoices." }));
    }

    const parsed = invoiceStatusSchema.safeParse({
      status: formData.get("status")
    });

    if (!parsed.success) {
      redirect(billingUrl(`/billing/invoices/${invoiceId}`, { error: "Choose a valid invoice status." }));
    }

    const invoice = await getTenantInvoice(invoiceId, tenant.id);
    if (!invoice) {
      redirect(billingUrl("/billing", { error: "Invoice not found for this tenant." }));
    }

    const nextStatus = parsed.data.status;
    const allowed = getAllowedInvoiceTransitions(invoice.status);

    if (!allowed.includes(nextStatus)) {
      redirect(
        billingUrl(`/billing/invoices/${invoiceId}`, {
          error: `Invoices in ${invoice.status} status cannot transition to ${nextStatus}.`
        })
      );
    }

    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    const payload: InvoiceUpdate = {
      status: nextStatus,
      issue_date: nextStatus === "issued" ? invoice.issue_date ?? today : invoice.issue_date,
      paid_at: nextStatus === "paid" ? now : invoice.paid_at,
      paid_by_profile_id: nextStatus === "paid" ? actorProfileId : invoice.paid_by_profile_id,
      status_updated_at: now,
      status_updated_by_profile_id: actorProfileId
    };

    const { error } = await supabase
      .from("invoices")
      .update(payload as never)
      .eq("tenant_id", tenant.id)
      .eq("id", invoiceId);

    if (error) {
      redirect(billingUrl(`/billing/invoices/${invoiceId}`, { error: error.message }));
    }

    if (invoice.billing_cycle_id) {
      const cycleStatus: BillingCycleUpdate["status"] =
        nextStatus === "issued"
          ? "invoiced"
          : nextStatus === "paid"
            ? "paid"
            : nextStatus === "overdue"
              ? "overdue"
              : "closed";

      await supabase
        .from("billing_cycles")
        .update(({ status: cycleStatus } as BillingCycleUpdate) as never)
        .eq("tenant_id", tenant.id)
        .eq("id", invoice.billing_cycle_id);
    }
  } catch (error) {
    redirect(
      billingUrl(`/billing/invoices/${invoiceId}`, {
        error: error instanceof Error ? error.message : "Unable to update invoice."
      })
    );
  }

  revalidatePath("/billing");
  revalidatePath(`/billing/invoices/${invoiceId}`);
  revalidatePath("/dashboard");
  redirect(billingUrl(`/billing/invoices/${invoiceId}`, { success: "Invoice status updated." }));
}
