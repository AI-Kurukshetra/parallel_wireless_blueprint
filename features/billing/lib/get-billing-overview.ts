import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getTenantContext } from "@/lib/auth/access";
import type {
  BillingCycle,
  BillingCycleStatus,
  Invoice,
  InvoiceWorkflowStatus,
  SubscriptionPlan,
  SubscriptionSummary
} from "@/types/domain";
import type { Database } from "@/types/database";

type PlanRow = Database["public"]["Tables"]["subscription_plans"]["Row"];
type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];
type BillingCycleRow = Database["public"]["Tables"]["billing_cycles"]["Row"];
type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];

export type BillingFilters = {
  status?: InvoiceWorkflowStatus | "all";
  sort?: "due_asc" | "due_desc" | "issue_desc" | "total_desc";
};

function normalizeFeatureSummary(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {} as Record<string, string>;
  }

  return Object.fromEntries(
    Object.entries(input as Record<string, unknown>).map(([key, value]) => [key, String(value)])
  );
}

function mapPlan(plan: PlanRow): SubscriptionPlan {
  return {
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
  };
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

function mapCycle(cycle: BillingCycleRow): BillingCycle {
  return {
    id: cycle.id,
    cycleStart: cycle.cycle_start,
    cycleEnd: cycle.cycle_end,
    invoiceDate: cycle.invoice_date,
    dueDate: cycle.due_date,
    status: cycle.status as BillingCycleStatus
  };
}

export async function getBillingOverview(filters: BillingFilters = {}) {
  const supabase = createSupabaseAdminClient();
  const { tenant, profile } = await getTenantContext();
  const viewerRole = profile?.role ?? "viewer";
  const canManageBilling = viewerRole === "owner" || viewerRole === "admin";
  const statusFilter =
    filters.status && ["all", "draft", "issued", "paid", "overdue", "void"].includes(filters.status)
      ? filters.status
      : "all";
  const sortFilter =
    filters.sort && ["due_asc", "due_desc", "issue_desc", "total_desc"].includes(filters.sort)
      ? filters.sort
      : "due_asc";

  const planResult = await supabase.from("subscription_plans").select("*").order("price_monthly_cents", { ascending: true });
  if (planResult.error) throw planResult.error;
  const plans = ((planResult.data ?? []) as PlanRow[]).map(mapPlan);

  const subscriptionResult = await supabase
    .from("subscriptions")
    .select("*")
    .eq("tenant_id", tenant.id)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (subscriptionResult.error) throw subscriptionResult.error;

  const subscriptionRow = subscriptionResult.data as SubscriptionRow | null;
  const subscription = subscriptionRow
    ? ({
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
        plan: plans.find((plan) => plan.id === subscriptionRow.plan_id) ?? {
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
      } satisfies SubscriptionSummary)
    : null;

  let cycleQuery = supabase
    .from("billing_cycles")
    .select("*")
    .eq("tenant_id", tenant.id)
    .order("cycle_start", { ascending: false })
    .limit(6);

  if (subscriptionRow) {
    cycleQuery = cycleQuery.eq("subscription_id", subscriptionRow.id);
  }

  const cycleResult = await cycleQuery;
  if (cycleResult.error) throw cycleResult.error;
  const billingCycles = ((cycleResult.data ?? []) as BillingCycleRow[]).map(mapCycle);

  let invoiceQuery = supabase.from("invoices").select("*").eq("tenant_id", tenant.id);
  if (statusFilter !== "all") {
    invoiceQuery = invoiceQuery.eq("status", statusFilter);
  }

  switch (sortFilter) {
    case "due_desc":
      invoiceQuery = invoiceQuery.order("due_date", { ascending: false });
      break;
    case "issue_desc":
      invoiceQuery = invoiceQuery.order("issue_date", { ascending: false, nullsFirst: false });
      break;
    case "total_desc":
      invoiceQuery = invoiceQuery.order("total_cents", { ascending: false });
      break;
    case "due_asc":
    default:
      invoiceQuery = invoiceQuery.order("due_date", { ascending: true });
      break;
  }

  const invoiceResult = await invoiceQuery.limit(12);
  if (invoiceResult.error) throw invoiceResult.error;
  const invoices = ((invoiceResult.data ?? []) as InvoiceRow[]).map(mapInvoice);

  const outstandingBalance = invoices
    .filter((invoice) => invoice.status === "issued" || invoice.status === "overdue")
    .reduce((sum, invoice) => sum + invoice.total, 0);

  return {
    tenant,
    viewerRole,
    canManageBilling,
    plans,
    subscription,
    billingCycles,
    invoices,
    filters: {
      status: statusFilter,
      sort: sortFilter
    },
    summary: {
      outstandingBalance,
      openInvoices: invoices.filter((invoice) => invoice.status === "issued" || invoice.status === "overdue").length,
      latestInvoice: invoices[0] ?? null
    }
  };
}
