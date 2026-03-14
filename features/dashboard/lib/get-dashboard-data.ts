import type { DashboardMetric } from "@/types/domain";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getTenantContext } from "@/lib/auth/access";
import { average } from "@/lib/utils/numbers";
import type { Alarm, AnalyticsSnapshot, BaseStation, Invoice, Site } from "@/types/domain";
import type { Database } from "@/types/database";

type SiteRow = Database["public"]["Tables"]["sites"]["Row"];
type BaseStationRow = Database["public"]["Tables"]["base_stations"]["Row"];
type AlarmRow = Database["public"]["Tables"]["alarms"]["Row"];
type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];
type SnapshotRow = Database["public"]["Tables"]["network_snapshots"]["Row"];

export async function getDashboardData(): Promise<{
  metrics: DashboardMetric[];
  sites: Site[];
  alarms: Alarm[];
  stations: BaseStation[];
  analytics: AnalyticsSnapshot[];
}> {
  const supabase = createSupabaseAdminClient();
  const { tenant } = await getTenantContext();

  const [sitesResult, baseStationsResult, alarmsResult, invoicesResult, snapshotsResult] = await Promise.all([
    supabase.from("sites").select("*").eq("tenant_id", tenant.id).order("subscribers", { ascending: false }).limit(5),
    supabase.from("base_stations").select("*").eq("tenant_id", tenant.id).order("created_at", { ascending: true }).limit(5),
    supabase.from("alarms").select("*").eq("tenant_id", tenant.id).order("created_at", { ascending: false }).limit(4),
    supabase.from("invoices").select("*").eq("tenant_id", tenant.id).order("due_date", { ascending: true }),
    supabase
      .from("network_snapshots")
      .select("*")
      .eq("tenant_id", tenant.id)
      .order("snapshot_date", { ascending: true })
      .limit(4)
  ]);

  if (sitesResult.error) throw sitesResult.error;
  if (baseStationsResult.error) throw baseStationsResult.error;
  if (alarmsResult.error) throw alarmsResult.error;
  if (invoicesResult.error) throw invoicesResult.error;
  if (snapshotsResult.error) throw snapshotsResult.error;

  const sites = (sitesResult.data ?? []) as SiteRow[];
  const baseStationRows = (baseStationsResult.data ?? []) as BaseStationRow[];
  const alarmRows = (alarmsResult.data ?? []) as AlarmRow[];
  const invoiceRows = (invoicesResult.data ?? []) as InvoiceRow[];
  const snapshotRows = (snapshotsResult.data ?? []) as SnapshotRow[];
  const siteMap = new Map(sites.map((site) => [site.id, site.name]));

  const stations: BaseStation[] = baseStationRows.map((station) => ({
    id: station.id,
    code: station.code,
    siteName: siteMap.get(station.site_id) ?? "Unknown site",
    vendor: station.vendor,
    powerLevel: station.power_level,
    backhaulUsage: station.backhaul_usage,
    status: station.status
  }));

  const alarms: Alarm[] = alarmRows.map((alarm) => ({
    id: alarm.id,
    title: alarm.title,
    siteName: siteMap.get(alarm.site_id) ?? "Unknown site",
    severity: alarm.severity,
    category: alarm.category,
    createdAt: alarm.created_at,
    acknowledged: alarm.acknowledged
  }));

  const invoices: Invoice[] = invoiceRows.map((invoice) => ({
    id: invoice.id,
    accountName: invoice.account_name,
    amount: invoice.amount_cents / 100,
    dueDate: invoice.due_date,
    status: invoice.status
  }));

  const analytics: AnalyticsSnapshot[] = snapshotRows.map((snapshot) => ({
    id: snapshot.id,
    label: snapshot.label,
    coverage: snapshot.coverage,
    utilization: snapshot.utilization,
    energyCost: snapshot.energy_cost_cents / 100
  }));

  const mappedSites: Site[] = sites.map((site) => ({
    id: site.id,
    name: site.name,
    region: site.region,
    uptime: Number(site.uptime),
    subscribers: site.subscribers,
    status: site.status,
    technology: site.technology
  }));

  const activeSites = mappedSites.filter((site) => site.status === "online").length;
  const criticalAlarms = alarms.filter((alarm) => alarm.severity === "critical" && !alarm.acknowledged).length;
  const monthlyRevenue = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const uptimeAverage = average(mappedSites.map((site) => site.uptime));
  const previousCoverage = analytics.at(-2)?.coverage ?? analytics[0]?.coverage ?? 0;
  const latestCoverage = analytics.at(-1)?.coverage ?? previousCoverage;
  const coverageTrend = latestCoverage - previousCoverage;

  const metrics: DashboardMetric[] = [
    {
      id: "network-availability",
      label: "Network availability",
      value: `${uptimeAverage.toFixed(1)}%`,
      trend: `${uptimeAverage >= 98 ? "+" : ""}${(uptimeAverage - 97.8).toFixed(1)}%`,
      trendDirection: uptimeAverage >= 97.8 ? "up" : "down"
    },
    {
      id: "active-sites",
      label: "Active sites",
      value: String(activeSites),
      trend: `${mappedSites.length} total`,
      trendDirection: "neutral"
    },
    {
      id: "critical-alarms",
      label: "Critical alarms",
      value: String(criticalAlarms),
      trend: criticalAlarms === 0 ? "No open critical" : `${criticalAlarms} open`,
      trendDirection: criticalAlarms === 0 ? "neutral" : "down"
    },
    {
      id: "monthly-revenue",
      label: "Monthly revenue",
      value: `$${Math.round(monthlyRevenue / 1000)}K`,
      trend: `${coverageTrend >= 0 ? "+" : ""}${coverageTrend.toFixed(1)} coverage pts`,
      trendDirection: coverageTrend >= 0 ? "up" : "down"
    }
  ];

  return {
    metrics,
    sites: mappedSites,
    alarms,
    stations,
    analytics
  };
}
