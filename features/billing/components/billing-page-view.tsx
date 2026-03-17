import Link from "next/link";

import { DataTable } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { getBillingOverview, type BillingFilters } from "@/features/billing/lib/get-billing-overview";
import { formatDateLabel } from "@/lib/utils/dates";
import { formatCurrency, formatEnumLabel } from "@/lib/utils/format";

function getInvoiceTone(status: string) {
  switch (status) {
    case "paid":
      return "success";
    case "issued":
      return "info";
    case "overdue":
      return "warning";
    case "void":
      return "neutral";
    default:
      return "neutral";
  }
}

function getCycleTone(status: string) {
  switch (status) {
    case "paid":
    case "closed":
      return "success";
    case "overdue":
      return "warning";
    case "invoiced":
      return "info";
    default:
      return "neutral";
  }
}

const statusOptions = [
  { value: "all", label: "All invoice states" },
  { value: "draft", label: "Draft" },
  { value: "issued", label: "Issued" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "void", label: "Void" }
] as const;

export async function BillingPageView({
  filters,
  success,
  error
}: {
  filters: BillingFilters;
  success?: string;
  error?: string;
}) {
  const overview = await getBillingOverview(filters);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Revenue operations"
        title="Subscription & Billing"
        description="Review tenant subscription health, billing cycles, invoice exposure, and current entitlements."
        action={<ButtonLink href="/billing/subscription">View Subscription</ButtonLink>}
      />
      {success ? <Notice tone="success">{success}</Notice> : null}
      {error ? <Notice tone="error">{error}</Notice> : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Current plan</CardTitle>
          </CardHeader>
          <CardContent>
            {overview.subscription ? (
              <>
                <p className="text-2xl font-semibold text-ink">{overview.subscription.plan.name}</p>
                <p className="mt-2 text-sm text-ink/60">
                  {formatCurrency(overview.subscription.plan.basePrice, overview.subscription.plan.currency)} /{" "}
                  {overview.subscription.plan.billingInterval}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge tone={overview.subscription.status === "active" ? "success" : "warning"}>
                    {formatEnumLabel(overview.subscription.status)}
                  </Badge>
                  <Badge tone="neutral">{overview.subscription.plan.supportTier}</Badge>
                </div>
              </>
            ) : (
              <Notice tone="info">No subscription has been configured for this tenant yet.</Notice>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Open balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-ink">{formatCurrency(overview.summary.outstandingBalance)}</p>
            <p className="mt-2 text-sm text-ink/60">
              {overview.summary.openInvoices} invoice{overview.summary.openInvoices === 1 ? "" : "s"} currently awaiting collection.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Renewal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-ink">
              {overview.subscription ? formatDateLabel(overview.subscription.renewsAt) : "Not scheduled"}
            </p>
            <p className="mt-2 text-sm text-ink/60">
              {overview.subscription?.currentPeriodStart && overview.subscription?.currentPeriodEnd
                ? `${formatDateLabel(overview.subscription.currentPeriodStart)} to ${formatDateLabel(overview.subscription.currentPeriodEnd)}`
                : "Subscription period details are not available."}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Available plans</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {overview.plans.map((plan) => (
              <div key={plan.id} className="rounded-3xl border border-ink/8 bg-surface p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-ink">{plan.name}</p>
                    <p className="text-sm text-ink/55">{plan.supportTier} support</p>
                  </div>
                  <Badge tone={plan.isActive ? "success" : "neutral"}>{plan.isActive ? "active" : "inactive"}</Badge>
                </div>
                <p className="mt-4 text-2xl font-semibold text-ink">
                  {formatCurrency(plan.basePrice, plan.currency)}
                  <span className="ml-1 text-sm font-medium text-ink/45">/{plan.billingInterval}</span>
                </p>
                <div className="mt-4 space-y-2 text-sm text-ink/65">
                  <p>{plan.siteLimit} sites included</p>
                  <p>{plan.baseStationLimit} base stations included</p>
                  {Object.entries(plan.featureSummary).slice(0, 3).map(([key, value]) => (
                    <p key={key} className="capitalize">
                      {key.replace(/_/g, " ")}: {value}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent billing cycles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview.billingCycles.length === 0 ? (
              <Notice tone="info">Billing cycles will appear here once the tenant subscription starts invoicing.</Notice>
            ) : null}
            {overview.billingCycles.map((cycle) => (
              <div key={cycle.id} className="rounded-2xl border border-ink/8 bg-surface px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-ink">
                    {formatDateLabel(cycle.cycleStart)} to {formatDateLabel(cycle.cycleEnd)}
                  </p>
                  <Badge tone={getCycleTone(cycle.status)}>{formatEnumLabel(cycle.status)}</Badge>
                </div>
                <p className="mt-2 text-sm text-ink/60">
                  Invoice date {formatDateLabel(cycle.invoiceDate)} • Due {formatDateLabel(cycle.dueDate)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <form method="get" className="grid gap-4 rounded-[1.75rem] border border-white/70 bg-white/85 p-6 shadow-panel md:grid-cols-3">
        <label className="grid gap-2 text-sm text-ink/70">
          <span className="font-medium text-ink">Invoice status</span>
          <select
            name="status"
            defaultValue={overview.filters.status}
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
          <span className="font-medium text-ink">Sort invoices</span>
          <select
            name="sort"
            defaultValue={overview.filters.sort}
            className="rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none transition focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/20"
          >
            <option value="due_asc">Due date, oldest first</option>
            <option value="due_desc">Due date, newest first</option>
            <option value="issue_desc">Issue date, newest first</option>
            <option value="total_desc">Largest total first</option>
          </select>
        </label>
        <div className="flex flex-wrap items-end gap-3">
          <button
            type="submit"
            className="inline-flex items-center rounded-full bg-accent px-5 py-3 text-sm font-medium text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            Apply Filters
          </button>
          <ButtonLink href="/billing" className="bg-white text-ink ring-1 ring-ink/10">
            Reset
          </ButtonLink>
        </div>
      </form>

      {overview.invoices.length === 0 ? (
        <Notice tone="info">No invoices match the current filter set for this tenant.</Notice>
      ) : null}

      <DataTable title="Tenant invoices" columns={["Invoice", "Issue", "Due", "Total", "Status", "Actions"]}>
        {overview.invoices.map((invoice) => (
          <tr key={invoice.id} className="bg-white">
            <td className="rounded-l-2xl px-4 py-4">
              <p className="font-medium text-ink">{invoice.invoiceNumber}</p>
              <p className="text-xs text-ink/50">{invoice.accountName}</p>
            </td>
            <td className="px-4 py-4 text-sm text-ink/65">{invoice.issueDate ? formatDateLabel(invoice.issueDate) : "Draft"}</td>
            <td className="px-4 py-4 text-sm text-ink/65">{formatDateLabel(invoice.dueDate)}</td>
            <td className="px-4 py-4 text-sm text-ink/65">{formatCurrency(invoice.total, invoice.currency)}</td>
            <td className="px-4 py-4">
              <Badge tone={getInvoiceTone(invoice.status)}>{formatEnumLabel(invoice.status)}</Badge>
            </td>
            <td className="rounded-r-2xl px-4 py-4 text-sm">
              <div className="flex flex-wrap gap-3">
                <Link href={`/billing/invoices/${invoice.id}`} className="font-medium text-accent">
                  View Invoice
                </Link>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
