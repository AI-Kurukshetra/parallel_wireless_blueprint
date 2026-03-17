import Link from "next/link";

import { DataTable } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { getAlarms, type AlarmListFilters } from "@/features/alarms/lib/get-alarms";
import { formatRelativeTime } from "@/lib/utils/dates";
import { formatEnumLabel } from "@/lib/utils/format";

const severityOptions = [
  { value: "all", label: "All severities" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" }
];

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "open", label: "Open" },
  { value: "acknowledged", label: "Acknowledged" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" }
];

export async function AlarmsPageView({
  filters,
  success,
  error
}: {
  filters: AlarmListFilters;
  success?: string;
  error?: string;
}) {
  const { alarms, filters: filterOptions } = await getAlarms(filters);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Incidents"
        title="Alarms"
        description="Acknowledge, assign, and track tenant-scoped operational alarms from one queue."
      />
      {success ? <Notice tone="success">{success}</Notice> : null}
      {error ? <Notice tone="error">{error}</Notice> : null}
      <form method="get" className="grid gap-4 rounded-[1.75rem] border border-white/70 bg-white/85 p-6 shadow-panel md:grid-cols-5">
        <label className="grid gap-2 text-sm text-ink/70">
          <span className="font-medium text-ink">Search</span>
          <input
            name="search"
            defaultValue={filters.search}
            placeholder="Title, message, vendor"
            className="rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none transition focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/20"
          />
        </label>
        <label className="grid gap-2 text-sm text-ink/70">
          <span className="font-medium text-ink">Severity</span>
          <select
            name="severity"
            defaultValue={filters.severity ?? "all"}
            className="rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none transition focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/20"
          >
            {severityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm text-ink/70">
          <span className="font-medium text-ink">Status</span>
          <select
            name="status"
            defaultValue={filters.status ?? "all"}
            className="rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none transition focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/20"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm text-ink/70">
          <span className="font-medium text-ink">Site</span>
          <select
            name="siteId"
            defaultValue={filters.siteId ?? ""}
            className="rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none transition focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/20"
          >
            <option value="">All sites</option>
            {filterOptions.sites.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm text-ink/70">
          <span className="font-medium text-ink">Base Station</span>
          <select
            name="baseStationId"
            defaultValue={filters.baseStationId ?? ""}
            className="rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none transition focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/20"
          >
            <option value="">All base stations</option>
            {filterOptions.baseStations.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm text-ink/70">
          <span className="font-medium text-ink">Sort</span>
          <select
            name="sort"
            defaultValue={filters.sort ?? "newest"}
            className="rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none transition focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/20"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="severity">Severity</option>
            <option value="status">Status</option>
          </select>
        </label>
        <div className="flex flex-wrap items-end gap-3 md:col-span-4">
          <button
            type="submit"
            className="inline-flex items-center rounded-full bg-accent px-5 py-3 text-sm font-medium text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            Apply Filters
          </button>
          <ButtonLink href="/alarms" className="bg-white text-ink ring-1 ring-ink/10">
            Reset
          </ButtonLink>
        </div>
      </form>
      {alarms.length === 0 ? (
        <Notice tone="info">No alarms match the current filter set for this tenant.</Notice>
      ) : null}
      <DataTable
        title="Alarm queue"
        columns={["Alarm", "Scope", "Status", "Created", "Assignee", "Severity", "Actions"]}
      >
        {alarms.map((alarm) => (
          <tr key={alarm.id} className="bg-white">
            <td className="rounded-l-2xl px-4 py-4">
              <p className="font-medium">{alarm.title}</p>
              <p className="text-xs text-ink/50">{alarm.sourceVendor ?? "Source not specified"}</p>
            </td>
            <td className="px-4 py-4 text-sm text-ink/65">
              <p>{alarm.siteName}</p>
              <p className="text-xs text-ink/45">{alarm.baseStationCode ?? "No base station"}</p>
            </td>
            <td className="px-4 py-4 text-sm text-ink/65">
              <Badge tone={alarm.status === "resolved" || alarm.status === "closed" ? "success" : "info"}>
                {formatEnumLabel(alarm.status)}
              </Badge>
            </td>
            <td className="px-4 py-4 text-sm text-ink/65">{formatRelativeTime(alarm.createdAt)}</td>
            <td className="px-4 py-4 text-sm text-ink/65">{alarm.assigneeName ?? "Unassigned"}</td>
            <td className="px-4 py-4">
              <Badge
                tone={
                  alarm.severity === "critical"
                    ? "danger"
                    : alarm.severity === "high"
                      ? "warning"
                      : alarm.severity === "medium"
                        ? "info"
                        : "neutral"
                }
              >
                {alarm.severity}
              </Badge>
            </td>
            <td className="rounded-r-2xl px-4 py-4 text-sm">
              <div className="flex flex-wrap gap-3">
                <Link href={`/alarms/${alarm.id}`} className="font-medium text-accent">
                  View Details
                </Link>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
