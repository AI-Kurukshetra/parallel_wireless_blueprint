import type { DashboardMetric } from "@/types/domain";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getTenantContext } from "@/lib/auth/access";
import { average } from "@/lib/utils/numbers";
import type {
  Alarm,
  AnalyticsSnapshot,
  BaseStation,
  Invoice,
  Site,
  SubscriptionSummary
} from "@/types/domain";
import type { Database } from "@/types/database";

type SiteRow = Database["public"]["Tables"]["sites"]["Row"];
type BaseStationRow = Database["public"]["Tables"]["base_stations"]["Row"];
type AlarmRow = Database["public"]["Tables"]["alarms"]["Row"];
type AlarmEventRow = Database["public"]["Tables"]["alarm_events"]["Row"];
type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];
type SnapshotRow = Database["public"]["Tables"]["network_snapshots"]["Row"];
type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];
type PlanRow = Database["public"]["Tables"]["subscription_plans"]["Row"];

export type RecentActivityItem = {
  id: string;
  type: "alarm" | "invoice";
  title: string;
  description: string;
  occurredAt: string;
  href: string;
};

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

export async function getDashboardData(): Promise<{
  metrics: DashboardMetric[];
  sites: Site[];
  alarms: Alarm[];
  stations: BaseStation[];
  analytics: AnalyticsSnapshot[];
  recentActivity: RecentActivityItem[];
  subscription: SubscriptionSummary | null;
  summary: {
    activeSites: number;
    activeStations: number;
    openAlarms: number;
    criticalAlarms: number;
    acknowledgedAlarms: number;
    unresolvedAlarms: number;
    paidInvoices: number;
    overdueInvoices: number;
    outstandingBalance: number;
  };
}> {
  const supabase = createSupabaseAdminClient();
  const { tenant } = await getTenantContext();

  const [sitesResult, baseStationsResult, alarmsResult, alarmEventsResult, invoicesResult, snapshotsResult, subscriptionsResult, plansResult] =
    await Promise.all([
      supabase.from("sites").select("*").eq("tenant_id", tenant.id).order("subscribers", { ascending: false }),
      supabase.from("base_stations").select("*").eq("tenant_id", tenant.id).order("created_at", { ascending: true }),
      supabase.from("alarms").select("*").eq("tenant_id", tenant.id).order("created_at", { ascending: false }),
      supabase.from("alarm_events").select("*").eq("tenant_id", tenant.id).order("created_at", { ascending: false }).limit(6),
      supabase.from("invoices").select("*").eq("tenant_id", tenant.id).order("due_date", { ascending: true }),
      supabase
        .from("network_snapshots")
        .select("*")
        .eq("tenant_id", tenant.id)
        .order("snapshot_date", { ascending: true })
        .limit(6),
      supabase
        .from("subscriptions")
        .select("*")
        .eq("tenant_id", tenant.id)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("subscription_plans").select("*").order("price_monthly_cents", { ascending: true })
    ]);

  if (sitesResult.error) throw sitesResult.error;
  if (baseStationsResult.error) throw baseStationsResult.error;
  if (alarmsResult.error) throw alarmsResult.error;
  if (alarmEventsResult.error) throw alarmEventsResult.error;
  if (invoicesResult.error) throw invoicesResult.error;
  if (snapshotsResult.error) throw snapshotsResult.error;
  if (subscriptionsResult.error) throw subscriptionsResult.error;
  if (plansResult.error) throw plansResult.error;

  const siteRows = (sitesResult.data ?? []) as SiteRow[];
  const baseStationRows = (baseStationsResult.data ?? []) as BaseStationRow[];
  const alarmRows = (alarmsResult.data ?? []) as AlarmRow[];
  const alarmEvents = (alarmEventsResult.data ?? []) as AlarmEventRow[];
  const invoiceRows = (invoicesResult.data ?? []) as InvoiceRow[];
  const snapshotRows = (snapshotsResult.data ?? []) as SnapshotRow[];
  const subscriptionRow = subscriptionsResult.data as SubscriptionRow | null;
  const plans = (plansResult.data ?? []) as PlanRow[];

  const siteMap = new Map(siteRows.map((site) => [site.id, site]));
  const stationMap = new Map(baseStationRows.map((station) => [station.id, station]));
  const alarmMap = new Map(alarmRows.map((alarm) => [alarm.id, alarm]));

  const sites: Site[] = siteRows.map((site) => ({
    id: site.id,
    code: site.code,
    name: site.name,
    region: site.region,
    uptime: Number(site.uptime),
    subscribers: site.subscribers,
    status: site.status,
    technology: site.technology,
    coveragePercent: site.coverage_percent,
    monthlyEnergyCost: site.monthly_energy_cost_cents / 100,
    isActive: site.is_active
  }));

  const stations: BaseStation[] = baseStationRows.map((station) => {
    const site = siteMap.get(station.site_id);

    return {
      id: station.id,
      code: station.code,
      siteId: station.site_id,
      siteName: site?.name ?? "Unknown site",
      siteCode: site?.code ?? "N/A",
      vendor: station.vendor,
      powerLevel: station.power_level,
      backhaulUsage: station.backhaul_usage,
      status: station.status,
      isActive: station.is_active
    };
  });

  const alarms: Alarm[] = alarmRows.map((alarm) => ({
    id: alarm.id,
    title: alarm.title,
    siteId: alarm.site_id,
    siteName: siteMap.get(alarm.site_id)?.name ?? "Unknown site",
    baseStationId: alarm.base_station_id,
    baseStationCode: alarm.base_station_id ? stationMap.get(alarm.base_station_id)?.code ?? null : null,
    severity: alarm.severity,
    status: alarm.status,
    category: alarm.category,
    sourceVendor: alarm.source_vendor,
    description: alarm.description,
    message: alarm.message,
    createdAt: alarm.created_at,
    acknowledged: alarm.acknowledged,
    acknowledgedAt: alarm.acknowledged_at,
    assigneeProfileId: alarm.assignee_profile_id,
    assigneeName: null,
    assignedAt: alarm.assigned_at
  }));

  const invoices = invoiceRows.map(mapInvoice);

  const analytics: AnalyticsSnapshot[] = snapshotRows.map((snapshot) => ({
    id: snapshot.id,
    label: snapshot.label,
    coverage: snapshot.coverage,
    utilization: snapshot.utilization,
    energyCost: snapshot.energy_cost_cents / 100
  }));

  const subscription = subscriptionRow
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
          plans
            .map((plan) => ({
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
            }))
            .find((plan) => plan.id === subscriptionRow.plan_id) ?? {
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

  const activeSites = sites.filter((site) => site.isActive).length;
  const activeStations = stations.filter((station) => station.isActive).length;
  const openAlarms = alarms.filter((alarm) => alarm.status !== "resolved" && alarm.status !== "closed").length;
  const criticalAlarms = alarms.filter(
    (alarm) => alarm.severity === "critical" && alarm.status !== "resolved" && alarm.status !== "closed"
  ).length;
  const acknowledgedAlarms = alarms.filter((alarm) => alarm.status === "acknowledged").length;
  const unresolvedAlarms = alarms.filter((alarm) => alarm.status !== "resolved" && alarm.status !== "closed").length;
  const paidInvoices = invoices.filter((invoice) => invoice.status === "paid").length;
  const overdueInvoices = invoices.filter((invoice) => invoice.status === "overdue").length;
  const outstandingBalance = invoices
    .filter((invoice) => invoice.status === "issued" || invoice.status === "overdue")
    .reduce((sum, invoice) => sum + invoice.total, 0);

  const uptimeAverage = average(sites.filter((site) => site.isActive).map((site) => site.uptime));
  const previousCoverage = analytics.at(-2)?.coverage ?? analytics[0]?.coverage ?? 0;
  const latestCoverage = analytics.at(-1)?.coverage ?? previousCoverage;
  const coverageTrend = latestCoverage - previousCoverage;

  const metrics: DashboardMetric[] = [
    {
      id: "active-sites",
      label: "Active sites",
      value: String(activeSites),
      trend: `${sites.length} total`,
      trendDirection: "neutral"
    },
    {
      id: "active-stations",
      label: "Active base stations",
      value: String(activeStations),
      trend: `${stations.length} deployed`,
      trendDirection: "neutral"
    },
    {
      id: "open-alarms",
      label: "Open alarms",
      value: String(openAlarms),
      trend: criticalAlarms ? `${criticalAlarms} critical` : "No critical escalation",
      trendDirection: criticalAlarms ? "down" : "neutral"
    },
    {
      id: "alarm-workload",
      label: "Acknowledged vs unresolved",
      value: `${acknowledgedAlarms}/${unresolvedAlarms}`,
      trend: unresolvedAlarms ? "Acknowledged / unresolved" : "Queue clear",
      trendDirection: unresolvedAlarms ? "neutral" : "up"
    },
    {
      id: "subscription-plan",
      label: "Current plan",
      value: subscription?.plan.name ?? "Not assigned",
      trend: subscription ? subscription.status.replace("_", " ") : "No subscription",
      trendDirection: subscription?.status === "active" ? "up" : "neutral"
    },
    {
      id: "invoice-health",
      label: "Outstanding billing",
      value: `$${Math.round(outstandingBalance / 1000)}K`,
      trend: overdueInvoices ? `${overdueInvoices} overdue` : `${paidInvoices} paid`,
      trendDirection: overdueInvoices ? "down" : "up"
    },
    {
      id: "network-availability",
      label: "Average uptime",
      value: `${uptimeAverage.toFixed(1)}%`,
      trend: `${uptimeAverage >= 98 ? "+" : ""}${(uptimeAverage - 97.8).toFixed(1)} vs target`,
      trendDirection: uptimeAverage >= 97.8 ? "up" : "down"
    },
    {
      id: "coverage-trend",
      label: "Coverage trend",
      value: `${latestCoverage.toFixed(1)}%`,
      trend: `${coverageTrend >= 0 ? "+" : ""}${coverageTrend.toFixed(1)} pts`,
      trendDirection: coverageTrend >= 0 ? "up" : "down"
    }
  ];

  const recentActivity: RecentActivityItem[] = [
    ...alarmEvents.map((event) => {
      const alarm = alarmMap.get(event.alarm_id);

      return {
        id: `alarm-${event.id}`,
        type: "alarm" as const,
        title: alarm?.title ?? "Alarm activity",
        description: event.message,
        occurredAt: event.created_at,
        href: alarm ? `/alarms/${alarm.id}` : "/alarms"
      };
    }),
    ...invoiceRows
      .filter((invoice) => invoice.status_updated_at)
      .slice(0, 4)
      .map((invoice) => ({
        id: `invoice-${invoice.id}`,
        type: "invoice" as const,
        title: invoice.invoice_number ?? `INV-${invoice.id.slice(0, 8).toUpperCase()}`,
        description: `Invoice moved to ${invoice.status}.`,
        occurredAt: invoice.status_updated_at ?? invoice.updated_at,
        href: `/billing/invoices/${invoice.id}`
      }))
  ]
    .sort((left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime())
    .slice(0, 6);

  return {
    metrics,
    sites: sites.slice(0, 5),
    alarms: alarms
      .filter((alarm) => alarm.status !== "resolved" && alarm.status !== "closed")
      .sort((left, right) => {
        const severityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityWeight[right.severity] - severityWeight[left.severity];
      })
      .slice(0, 5),
    stations: stations
      .sort((left, right) => {
        const healthLeft = left.powerLevel + left.backhaulUsage;
        const healthRight = right.powerLevel + right.backhaulUsage;
        return healthLeft - healthRight;
      })
      .slice(0, 5),
    analytics,
    recentActivity,
    subscription,
    summary: {
      activeSites,
      activeStations,
      openAlarms,
      criticalAlarms,
      acknowledgedAlarms,
      unresolvedAlarms,
      paidInvoices,
      overdueInvoices,
      outstandingBalance
    }
  };
}
