import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { MiniBarChart } from "@/components/charts/mini-bar-chart";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { getDashboardData } from "@/features/dashboard/lib/get-dashboard-data";
import { formatDateLabel, formatRelativeTime } from "@/lib/utils/dates";
import { formatCompactNumber, formatCurrency } from "@/lib/utils/format";

function getSeverityTone(severity: string) {
  switch (severity) {
    case "critical":
      return "danger";
    case "high":
      return "warning";
    case "medium":
      return "info";
    default:
      return "neutral";
  }
}

function getStatusTone(status: string) {
  if (status === "online" || status === "active") return "success";
  if (status === "degraded" || status === "overdue") return "warning";
  if (status === "offline") return "danger";
  return "neutral";
}

export async function DashboardOverview() {
  const { metrics, sites, alarms, stations, analytics, recentActivity, subscription, summary } = await getDashboardData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations overview"
        title="Tenant control plane"
        description="Executive-ready visibility across network footprint, alarm pressure, billing health, and current service posture."
        action={
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/analytics" className="gap-2">
              Explore analytics
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/alarms" className="bg-white text-ink ring-1 ring-ink/10">
              Review alarms
            </ButtonLink>
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <StatCard key={metric.id} {...metric} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-ink/8 bg-gradient-to-r from-telecom-700 to-telecom-500 text-white">
            <CardTitle className="text-white">Operational health summary</CardTitle>
            <p className="text-sm text-white/80">
              A compact readout of current network footprint, alarm load, and commercial posture.
            </p>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
            <div className="rounded-3xl bg-surface p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Network footprint</p>
              <div className="mt-4 space-y-3 text-sm text-ink/70">
                <div className="flex items-center justify-between">
                  <span>Active sites</span>
                  <span className="font-medium text-ink">{summary.activeSites}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Active base stations</span>
                  <span className="font-medium text-ink">{summary.activeStations}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Critical alarms</span>
                  <span className="font-medium text-ink">{summary.criticalAlarms}</span>
                </div>
              </div>
            </div>
            <div className="rounded-3xl bg-surface p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Alarm pressure</p>
              <div className="mt-4 space-y-3 text-sm text-ink/70">
                <div className="flex items-center justify-between">
                  <span>Open alarms</span>
                  <span className="font-medium text-ink">{summary.openAlarms}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Acknowledged</span>
                  <span className="font-medium text-ink">{summary.acknowledgedAlarms}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Unresolved</span>
                  <span className="font-medium text-ink">{summary.unresolvedAlarms}</span>
                </div>
              </div>
            </div>
            <div className="rounded-3xl bg-surface p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Subscription</p>
              {subscription ? (
                <>
                  <p className="mt-3 text-lg font-semibold text-ink">{subscription.plan.name}</p>
                  <p className="text-sm text-ink/60">
                    {subscription.status.replace("_", " ")} • renews {formatDateLabel(subscription.renewsAt)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge tone={subscription.status === "active" ? "success" : "warning"}>
                      {subscription.status.replace("_", " ")}
                    </Badge>
                    <Badge tone="neutral">{subscription.plan.supportTier}</Badge>
                  </div>
                </>
              ) : (
                <Notice tone="info" className="mt-3">
                  No subscription data is available for this tenant.
                </Notice>
              )}
            </div>
            <div className="rounded-3xl bg-surface p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Billing health</p>
              <p className="mt-3 text-lg font-semibold text-ink">{formatCurrency(summary.outstandingBalance)}</p>
              <p className="text-sm text-ink/60">
                {summary.overdueInvoices} overdue • {summary.paidInvoices} paid
              </p>
              <Link href="/billing" className="mt-3 inline-flex text-sm font-medium text-accent">
                Open billing workspace
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <p className="text-sm text-ink/60">Latest tenant-scoped operational and billing events.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.length === 0 ? <Notice tone="info">No recent activity has been recorded yet.</Notice> : null}
            {recentActivity.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="block rounded-2xl border border-ink/8 bg-surface px-4 py-4 transition hover:border-accent/25"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">{item.title}</p>
                    <p className="text-sm text-ink/60">{item.description}</p>
                  </div>
                  <Badge tone={item.type === "alarm" ? "warning" : "info"}>{item.type}</Badge>
                </div>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-ink/40">{formatRelativeTime(item.occurredAt)}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Coverage and utilization</CardTitle>
            <p className="text-sm text-ink/60">Recent network snapshots from the tenant analytics feed.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {analytics.length === 0 ? <Notice tone="info">No network snapshots are available yet.</Notice> : null}
            {analytics.length > 0 ? <MiniBarChart values={analytics.map((item) => item.coverage)} /> : null}
            <div className="grid gap-3 md:grid-cols-2">
              {analytics.map((snapshot) => (
                <div key={snapshot.id} className="rounded-2xl border border-ink/8 bg-surface px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-ink">{snapshot.label}</p>
                    <Badge tone="info">{snapshot.coverage}% coverage</Badge>
                  </div>
                  <p className="mt-2 text-sm text-ink/60">{snapshot.utilization}% utilization</p>
                  <p className="mt-1 text-sm text-ink/60">Energy {formatCurrency(snapshot.energyCost)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority alarm queue</CardTitle>
            <p className="text-sm text-ink/60">Highest-priority incidents still requiring operational action.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {alarms.length === 0 ? <Notice tone="success">No unresolved alarms are currently open.</Notice> : null}
            {alarms.map((alarm) => (
              <Link
                key={alarm.id}
                href={`/alarms/${alarm.id}`}
                className="block rounded-2xl border border-ink/8 bg-surface px-4 py-4 transition hover:border-accent/25"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">{alarm.title}</p>
                    <p className="text-sm text-ink/55">
                      {alarm.siteName} • {alarm.baseStationCode ?? "No base station"}
                    </p>
                  </div>
                  <Badge tone={getSeverityTone(alarm.severity)}>{alarm.severity}</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.2em] text-ink/40">
                  <span>{alarm.category}</span>
                  <span>{formatRelativeTime(alarm.createdAt)}</span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Site portfolio</CardTitle>
            <p className="text-sm text-ink/60">Top subscriber locations with their current operating state.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {sites.length === 0 ? <Notice tone="info">No sites have been created for this tenant.</Notice> : null}
            {sites.map((site) => (
              <Link
                key={site.id}
                href={`/sites/${site.id}`}
                className="flex items-center justify-between rounded-2xl border border-ink/8 bg-surface px-4 py-4 transition hover:border-accent/25"
              >
                <div>
                  <p className="font-medium text-ink">{site.name}</p>
                  <p className="text-sm text-ink/55">
                    {site.region} • {formatCompactNumber(site.subscribers)} subscribers
                  </p>
                </div>
                <Badge tone={getStatusTone(site.status)}>{site.status}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Base station watchlist</CardTitle>
            <p className="text-sm text-ink/60">Stations most likely to need review based on current load and power posture.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {stations.length === 0 ? <Notice tone="info">No base stations are available for this tenant yet.</Notice> : null}
            {stations.map((station) => (
              <Link
                key={station.id}
                href={`/base-stations/${station.id}`}
                className="block rounded-2xl border border-ink/8 bg-surface px-4 py-4 transition hover:border-accent/25"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">{station.code}</p>
                    <p className="text-sm text-ink/55">{station.siteName}</p>
                  </div>
                  <Badge tone={getStatusTone(station.status)}>{station.status}</Badge>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white px-3 py-2 text-sm text-ink/60">Power {station.powerLevel}%</div>
                  <div className="rounded-2xl bg-white px-3 py-2 text-sm text-ink/60">
                    Backhaul {station.backhaulUsage}%
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
