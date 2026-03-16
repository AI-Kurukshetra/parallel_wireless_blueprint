import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getTenantContext } from "@/lib/auth/access";
import type { AnalyticsSnapshot } from "@/types/domain";
import type { Database } from "@/types/database";

type SiteRow = Database["public"]["Tables"]["sites"]["Row"];
type BaseStationRow = Database["public"]["Tables"]["base_stations"]["Row"];
type AlarmRow = Database["public"]["Tables"]["alarms"]["Row"];
type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];
type SnapshotRow = Database["public"]["Tables"]["network_snapshots"]["Row"];

export type AnalyticsRange = 7 | 30 | 90;

export type BreakdownItem = {
  label: string;
  value: number;
};

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function addDays(date: Date, amount: number) {
  const value = new Date(date);
  value.setDate(value.getDate() + amount);
  return value;
}

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

function toBreakdown(map: Record<string, number>) {
  return Object.entries(map).map(([label, value]) => ({ label, value }));
}

export async function getAnalyticsData(period: AnalyticsRange = 30) {
  const supabase = createSupabaseAdminClient();
  const { tenant } = await getTenantContext();
  const now = startOfDay(new Date());
  const rangeStart = addDays(now, -(period - 1));
  const rangeStartIso = rangeStart.toISOString();

  const [sitesResult, stationsResult, alarmsResult, invoicesResult, snapshotsResult] = await Promise.all([
    supabase.from("sites").select("*").eq("tenant_id", tenant.id),
    supabase.from("base_stations").select("*").eq("tenant_id", tenant.id),
    supabase.from("alarms").select("*").eq("tenant_id", tenant.id).order("created_at", { ascending: true }),
    supabase.from("invoices").select("*").eq("tenant_id", tenant.id),
    supabase
      .from("network_snapshots")
      .select("*")
      .eq("tenant_id", tenant.id)
      .order("snapshot_date", { ascending: true })
      .limit(8)
  ]);

  if (sitesResult.error) throw sitesResult.error;
  if (stationsResult.error) throw stationsResult.error;
  if (alarmsResult.error) throw alarmsResult.error;
  if (invoicesResult.error) throw invoicesResult.error;
  if (snapshotsResult.error) throw snapshotsResult.error;

  const sites = (sitesResult.data ?? []) as SiteRow[];
  const stations = (stationsResult.data ?? []) as BaseStationRow[];
  const alarms = (alarmsResult.data ?? []) as AlarmRow[];
  const invoices = (invoicesResult.data ?? []) as InvoiceRow[];
  const snapshots: AnalyticsSnapshot[] = ((snapshotsResult.data ?? []) as SnapshotRow[]).map((snapshot) => ({
    id: snapshot.id,
    label: snapshot.label,
    coverage: snapshot.coverage,
    utilization: snapshot.utilization,
    energyCost: snapshot.energy_cost_cents / 100
  }));

  const alarmsInRange = alarms.filter((alarm) => new Date(alarm.created_at).getTime() >= rangeStart.getTime());
  const invoicesInRange = invoices.filter((invoice) => {
    const dateValue = invoice.issue_date ?? invoice.created_at;
    return new Date(dateValue).getTime() >= rangeStart.getTime();
  });

  const alarmSeverity = toBreakdown({
    critical: alarms.filter((alarm) => alarm.severity === "critical").length,
    high: alarms.filter((alarm) => alarm.severity === "high").length,
    medium: alarms.filter((alarm) => alarm.severity === "medium").length,
    low: alarms.filter((alarm) => alarm.severity === "low").length
  });

  const alarmStatus = toBreakdown({
    open: alarms.filter((alarm) => alarm.status === "open").length,
    acknowledged: alarms.filter((alarm) => alarm.status === "acknowledged").length,
    in_progress: alarms.filter((alarm) => alarm.status === "in_progress").length,
    resolved: alarms.filter((alarm) => alarm.status === "resolved").length,
    closed: alarms.filter((alarm) => alarm.status === "closed").length
  });

  const invoiceStatus = toBreakdown({
    draft: invoices.filter((invoice) => invoice.status === "draft").length,
    issued: invoices.filter((invoice) => invoice.status === "issued").length,
    paid: invoices.filter((invoice) => invoice.status === "paid").length,
    overdue: invoices.filter((invoice) => invoice.status === "overdue").length,
    void: invoices.filter((invoice) => invoice.status === "void").length
  });

  const alarmTrend = Array.from({ length: period }, (_, index) => {
    const date = addDays(rangeStart, index);
    const nextDate = addDays(date, 1);
    const count = alarmsInRange.filter((alarm) => {
      const createdAt = new Date(alarm.created_at);
      return createdAt >= date && createdAt < nextDate;
    }).length;

    return {
      label: formatShortDate(date),
      value: count
    };
  });

  const openAlarms = alarms.filter((alarm) => alarm.status !== "resolved" && alarm.status !== "closed").length;
  const criticalAlarms = alarms.filter(
    (alarm) => alarm.severity === "critical" && alarm.status !== "resolved" && alarm.status !== "closed"
  ).length;
  const billedTotal = invoicesInRange.reduce(
    (sum, invoice) => sum + ((invoice.total_cents || invoice.amount_cents) / 100),
    0
  );
  const collectedTotal = invoices
    .filter((invoice) => invoice.status === "paid")
    .reduce((sum, invoice) => sum + ((invoice.total_cents || invoice.amount_cents) / 100), 0);
  const outstandingBalance = invoices
    .filter((invoice) => invoice.status === "issued" || invoice.status === "overdue")
    .reduce((sum, invoice) => sum + ((invoice.total_cents || invoice.amount_cents) / 100), 0);

  return {
    tenant,
    period,
    snapshots,
    kpis: {
      operationalHealth: {
        openAlarms,
        criticalAlarms,
        activeSites: sites.filter((site) => site.is_active).length,
        activeStations: stations.filter((station) => station.is_active).length
      },
      billingHealth: {
        billedTotal,
        collectedTotal,
        outstandingBalance,
        issuedInvoices: invoices.filter((invoice) => invoice.status === "issued").length,
        overdueInvoices: invoices.filter((invoice) => invoice.status === "overdue").length
      }
    },
    siteState: {
      active: sites.filter((site) => site.is_active).length,
      inactive: sites.filter((site) => !site.is_active).length,
      online: sites.filter((site) => site.status === "online").length,
      degraded: sites.filter((site) => site.status === "degraded").length,
      offline: sites.filter((site) => site.status === "offline").length
    },
    stationState: {
      active: stations.filter((station) => station.is_active).length,
      inactive: stations.filter((station) => !station.is_active).length,
      online: stations.filter((station) => station.status === "online").length,
      degraded: stations.filter((station) => station.status === "degraded").length,
      offline: stations.filter((station) => station.status === "offline").length
    },
    alarmSeverity,
    alarmStatus,
    invoiceStatus,
    alarmTrend,
    summaries: {
      alarmsInRange: alarmsInRange.length,
      invoicesInRange: invoicesInRange.length,
      averageCoverage: snapshots.length
        ? snapshots.reduce((sum, snapshot) => sum + snapshot.coverage, 0) / snapshots.length
        : 0,
      averageUtilization: snapshots.length
        ? snapshots.reduce((sum, snapshot) => sum + snapshot.utilization, 0) / snapshots.length
        : 0
    }
  };
}
