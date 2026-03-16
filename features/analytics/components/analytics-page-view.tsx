import { MiniBarChart } from "@/components/charts/mini-bar-chart";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { getAnalyticsData, type AnalyticsRange, type BreakdownItem } from "@/features/analytics/lib/get-analytics-data";
import { formatCurrency } from "@/lib/utils/format";

function BreakdownList({
  title,
  description,
  items
}: {
  title: string;
  description: string;
  items: BreakdownItem[];
}) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-ink/60">{description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.every((item) => item.value === 0) ? <Notice tone="info">No data is available for this breakdown yet.</Notice> : null}
        {items.map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-sm text-ink/70">
              <span className="capitalize">{item.label.replace(/_/g, " ")}</span>
              <span className="font-medium text-ink">{item.value}</span>
            </div>
            <div className="h-2 rounded-full bg-surface">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-telecom-700 to-telecom-400"
                style={{ width: `${Math.max((item.value / maxValue) * 100, item.value > 0 ? 8 : 0)}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export async function AnalyticsPageView({ period }: { period: AnalyticsRange }) {
  const analytics = await getAnalyticsData(period);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Insights"
        title="Analytics"
        description="Tenant-scoped reporting for operational health, alarm pressure, network footprint, and billing performance."
        action={
          <div className="flex flex-wrap gap-3">
            {[7, 30, 90].map((value) => (
              <ButtonLink
                key={value}
                href={`/analytics?period=${value}`}
                className={value === period ? "" : "bg-white text-ink ring-1 ring-ink/10"}
              >
                {value}d
              </ButtonLink>
            ))}
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-ink/60">Operational health</p>
            <p className="mt-4 text-3xl font-semibold tracking-tight text-ink">{analytics.kpis.operationalHealth.activeSites}</p>
            <p className="mt-2 text-sm text-ink/60">
              active sites • {analytics.kpis.operationalHealth.activeStations} active stations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-ink/60">Alarm pressure</p>
            <p className="mt-4 text-3xl font-semibold tracking-tight text-ink">{analytics.kpis.operationalHealth.openAlarms}</p>
            <p className="mt-2 text-sm text-ink/60">
              open alarms • {analytics.kpis.operationalHealth.criticalAlarms} critical
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-ink/60">Billed in range</p>
            <p className="mt-4 text-3xl font-semibold tracking-tight text-ink">
              {formatCurrency(analytics.kpis.billingHealth.billedTotal)}
            </p>
            <p className="mt-2 text-sm text-ink/60">{analytics.summaries.invoicesInRange} invoices in the selected range</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-ink/60">Outstanding balance</p>
            <p className="mt-4 text-3xl font-semibold tracking-tight text-ink">
              {formatCurrency(analytics.kpis.billingHealth.outstandingBalance)}
            </p>
            <p className="mt-2 text-sm text-ink/60">
              {analytics.kpis.billingHealth.overdueInvoices} overdue • {analytics.kpis.billingHealth.issuedInvoices} issued
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Alarm trend</CardTitle>
            <p className="text-sm text-ink/60">
              Alarm creation volume over the last {period} days. This is a simple timestamp grouping from real alarm records.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <MiniBarChart values={analytics.alarmTrend.map((item) => item.value)} />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {analytics.alarmTrend.slice(-6).map((item) => (
                <div key={item.label} className="rounded-2xl border border-ink/8 bg-surface px-4 py-4">
                  <p className="font-medium text-ink">{item.label}</p>
                  <p className="mt-2 text-sm text-ink/60">{item.value} alarms opened</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Network snapshot baseline</CardTitle>
            <p className="text-sm text-ink/60">Current averages from recent network snapshots.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.snapshots.length === 0 ? <Notice tone="info">No network snapshots are available for analytics yet.</Notice> : null}
            <div className="rounded-3xl bg-surface p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Average coverage</p>
              <p className="mt-3 text-2xl font-semibold text-ink">{analytics.summaries.averageCoverage.toFixed(1)}%</p>
            </div>
            <div className="rounded-3xl bg-surface p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Average utilization</p>
              <p className="mt-3 text-2xl font-semibold text-ink">{analytics.summaries.averageUtilization.toFixed(1)}%</p>
            </div>
            <div className="space-y-3">
              {analytics.snapshots.map((snapshot) => (
                <div key={snapshot.id} className="rounded-2xl border border-ink/8 bg-surface px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-ink">{snapshot.label}</p>
                    <Badge tone="info">{snapshot.coverage}% coverage</Badge>
                  </div>
                  <p className="mt-2 text-sm text-ink/60">
                    {snapshot.utilization}% utilization • Energy {formatCurrency(snapshot.energyCost)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <BreakdownList
          title="Alarms by severity"
          description="Current distribution of alarm criticality for this tenant."
          items={analytics.alarmSeverity}
        />
        <BreakdownList
          title="Alarms by status"
          description="Current workflow state distribution across the alarm queue."
          items={analytics.alarmStatus}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Site state summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-4">
              <span className="text-sm text-ink/65">Active vs inactive</span>
              <span className="font-medium text-ink">
                {analytics.siteState.active} / {analytics.siteState.inactive}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-4">
              <span className="text-sm text-ink/65">Online</span>
              <span className="font-medium text-ink">{analytics.siteState.online}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-4">
              <span className="text-sm text-ink/65">Degraded</span>
              <span className="font-medium text-ink">{analytics.siteState.degraded}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-4">
              <span className="text-sm text-ink/65">Offline</span>
              <span className="font-medium text-ink">{analytics.siteState.offline}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Base station state summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-4">
              <span className="text-sm text-ink/65">Active vs inactive</span>
              <span className="font-medium text-ink">
                {analytics.stationState.active} / {analytics.stationState.inactive}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-4">
              <span className="text-sm text-ink/65">Online</span>
              <span className="font-medium text-ink">{analytics.stationState.online}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-4">
              <span className="text-sm text-ink/65">Degraded</span>
              <span className="font-medium text-ink">{analytics.stationState.degraded}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-4">
              <span className="text-sm text-ink/65">Offline</span>
              <span className="font-medium text-ink">{analytics.stationState.offline}</span>
            </div>
          </CardContent>
        </Card>

        <BreakdownList
          title="Invoice status summary"
          description="Current invoice lifecycle distribution for the tenant."
          items={analytics.invoiceStatus}
        />
      </section>
    </div>
  );
}
