import { notFound } from "next/navigation";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getTenantContext } from "@/lib/auth/access";
import type { BillingCycle, Invoice, InvoiceLineItem, SubscriptionSummary } from "@/types/domain";
import type { Database } from "@/types/database";

type PlanRow = Database["public"]["Tables"]["subscription_plans"]["Row"];
type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];
type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];
type BillingCycleRow = Database["public"]["Tables"]["billing_cycles"]["Row"];
type InvoiceLineItemRow = Database["public"]["Tables"]["invoice_line_items"]["Row"];

function normalizeFeatureSummary(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {} as Record<string, string>;
  }

  return Object.fromEntries(
    Object.entries(input as Record<string, unknown>).map(([key, value]) => [key, String(value)])
  );
}

function mapInvoice(invoice: InvoiceRow): Invoice {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoice_number ?? `INV-${invoice.id.slice(0, 8).toUpperCase()}`,
    accountName: invoice.account_name,
    subtotal: (invoice.subtotal_cents || invoice.amount_cents) / 100,
    total: (invoice.total_cents || invoice.amount_cents) / 100,
    currency: invoice.currency,
    issueDate: invoice.issue_date,
    dueDate: invoice.due_date,
    status: invoice.status,
    billingCycleId: invoice.billing_cycle_id,
    paidAt: invoice.paid_at,
    subscriptionId: invoice.subscription_id
  };
}

function mapCycle(cycle: BillingCycleRow | null): BillingCycle | null {
  if (!cycle) return null;

  return {
    id: cycle.id,
    cycleStart: cycle.cycle_start,
    cycleEnd: cycle.cycle_end,
    invoiceDate: cycle.invoice_date,
    dueDate: cycle.due_date,
    status: cycle.status
  };
}

export async function getInvoiceDetail(invoiceId: string) {
  const supabase = createSupabaseAdminClient();
  const { tenant, profile } = await getTenantContext();
  const viewerRole = profile?.role ?? "viewer";
  const canManageBilling = viewerRole === "owner" || viewerRole === "admin";

  const invoiceResult = await supabase
    .from("invoices")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("id", invoiceId)
    .maybeSingle();

  if (invoiceResult.error) throw invoiceResult.error;

  const invoiceRow = invoiceResult.data as InvoiceRow | null;
  if (!invoiceRow) {
    notFound();
  }

  const [lineItemsResult, cycleResult, subscriptionResult, plansResult] = await Promise.all([
    supabase
      .from("invoice_line_items")
      .select("*")
      .eq("tenant_id", tenant.id)
      .eq("invoice_id", invoiceId)
      .order("created_at", { ascending: true }),
    invoiceRow.billing_cycle_id
      ? supabase
          .from("billing_cycles")
          .select("*")
          .eq("tenant_id", tenant.id)
          .eq("id", invoiceRow.billing_cycle_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    invoiceRow.subscription_id
      ? supabase
          .from("subscriptions")
          .select("*")
          .eq("tenant_id", tenant.id)
          .eq("id", invoiceRow.subscription_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabase.from("subscription_plans").select("*").order("price_monthly_cents", { ascending: true })
  ]);

  if (lineItemsResult.error) throw lineItemsResult.error;
  if (cycleResult.error) throw cycleResult.error;
  if (subscriptionResult.error) throw subscriptionResult.error;
  if (plansResult.error) throw plansResult.error;

  const plans = ((plansResult.data ?? []) as PlanRow[]).map((plan) => ({
    id: plan.id,
    code: plan.code,
    name: plan.name,
    billingInterval: plan.billing_interval,
    basePrice: plan.price_monthly_cents / 100,
    currency: plan.currency,
    siteLimit: plan.site_limit,
    baseStationLimit: plan.base_station_limit,
    supportTier: plan.support_tier,
    isActive: plan.is_active,
    featureSummary: normalizeFeatureSummary(plan.feature_summary)
  }));

  const subscriptionRow = subscriptionResult.data as SubscriptionRow | null;
  const subscription: SubscriptionSummary | null = subscriptionRow
    ? {
        id: subscriptionRow.id,
        status: subscriptionRow.status,
        seats: subscriptionRow.seats,
        startedAt: subscriptionRow.started_at,
        renewsAt: subscriptionRow.renews_at,
        currentPeriodStart: subscriptionRow.current_period_start,
        currentPeriodEnd: subscriptionRow.current_period_end,
        graceEndsAt: subscriptionRow.grace_ends_at,
        suspendedAt: subscriptionRow.suspended_at,
        canceledAt: subscriptionRow.canceled_at,
        plan:
          plans.find((plan) => plan.id === subscriptionRow.plan_id) ?? {
            id: subscriptionRow.plan_id,
            code: "custom",
            name: "Custom plan",
            billingInterval: "monthly",
            basePrice: 0,
            currency: "USD",
            siteLimit: 0,
            baseStationLimit: 0,
            supportTier: "Standard",
            isActive: true,
            featureSummary: {}
          }
      }
    : null;

  const lineItems: InvoiceLineItem[] = ((lineItemsResult.data ?? []) as InvoiceLineItemRow[]).map((item) => ({
    id: item.id,
    description: item.description,
    quantity: item.quantity,
    unitAmount: item.unit_amount_cents / 100,
    totalAmount: item.total_amount_cents / 100
  }));

  return {
    invoice: mapInvoice(invoiceRow),
    lineItems,
    billingCycle: mapCycle((cycleResult.data as BillingCycleRow | null) ?? null),
    subscription,
    canManageBilling
  };
}
