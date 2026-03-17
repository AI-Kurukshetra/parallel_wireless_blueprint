import Link from "next/link";

import { SubmitButton } from "@/components/forms/submit-button";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { updateInvoiceStatusAction } from "@/features/billing/lib/actions";
import { formatDateLabel } from "@/lib/utils/dates";
import { formatCurrency, formatEnumLabel } from "@/lib/utils/format";
import type { BillingCycle, Invoice, InvoiceLineItem, SubscriptionSummary } from "@/types/domain";

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

function getAvailableActions(status: Invoice["status"]) {
  switch (status) {
    case "draft":
      return [{ value: "issued", label: "Mark issued" }, { value: "void", label: "Void invoice" }];
    case "issued":
      return [
        { value: "paid", label: "Mark paid" },
        { value: "overdue", label: "Mark overdue" },
        { value: "void", label: "Void invoice" }
      ];
    case "overdue":
      return [{ value: "paid", label: "Mark paid" }];
    case "paid":
    case "void":
      return [];
  }
}

export function InvoiceDetailView({
  invoice,
  lineItems,
  billingCycle,
  subscription,
  canManageBilling,
  success,
  error
}: {
  invoice: Invoice;
  lineItems: InvoiceLineItem[];
  billingCycle: BillingCycle | null;
  subscription: SubscriptionSummary | null;
  canManageBilling: boolean;
  success?: string;
  error?: string;
}) {
  const updateStatus = updateInvoiceStatusAction.bind(null, invoice.id);
  const availableActions = getAvailableActions(invoice.status);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Invoice detail"
        title={invoice.invoiceNumber}
        description="Review invoice composition, lifecycle state, linked subscription context, and manual status handling."
        action={
          <ButtonLink href="/billing" className="bg-white text-ink ring-1 ring-ink/10">
            Back to Billing
          </ButtonLink>
        }
      />
      {success ? <Notice tone="success">{success}</Notice> : null}
      {error ? <Notice tone="error">{error}</Notice> : null}

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-surface px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Status</p>
                <div className="mt-3">
                  <Badge tone={getInvoiceTone(invoice.status)}>{formatEnumLabel(invoice.status)}</Badge>
                </div>
              </div>
              <div className="rounded-2xl bg-surface px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Total</p>
                <p className="mt-2 text-lg font-medium text-ink">{formatCurrency(invoice.total, invoice.currency)}</p>
              </div>
              <div className="rounded-2xl bg-surface px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Issued</p>
                <p className="mt-2 text-lg font-medium text-ink">{invoice.issueDate ? formatDateLabel(invoice.issueDate) : "Draft"}</p>
              </div>
              <div className="rounded-2xl bg-surface px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Due</p>
                <p className="mt-2 text-lg font-medium text-ink">{formatDateLabel(invoice.dueDate)}</p>
              </div>
              <div className="rounded-2xl bg-surface px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Account</p>
                <p className="mt-2 text-lg font-medium text-ink">{invoice.accountName}</p>
              </div>
              <div className="rounded-2xl bg-surface px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Paid at</p>
                <p className="mt-2 text-lg font-medium text-ink">{invoice.paidAt ? formatDateLabel(invoice.paidAt) : "Not paid"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoice line items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lineItems.length === 0 ? <Notice tone="info">No line items are available for this invoice.</Notice> : null}
              {lineItems.map((item) => (
                <div key={item.id} className="rounded-2xl border border-ink/8 bg-surface px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">{item.description}</p>
                      <p className="text-sm text-ink/55">
                        {item.quantity} × {formatCurrency(item.unitAmount, invoice.currency)}
                      </p>
                    </div>
                    <p className="font-medium text-ink">{formatCurrency(item.totalAmount, invoice.currency)}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manual invoice actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {canManageBilling ? (
                availableActions.length > 0 ? (
                  <form action={updateStatus} className="space-y-4">
                    <label className="grid gap-2 text-sm text-ink/70">
                      <span className="font-medium text-ink">Next status</span>
                      <select
                        name="status"
                        className="rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none transition focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/20"
                      >
                        {availableActions.map((action) => (
                          <option key={action.value} value={action.value}>
                            {action.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <SubmitButton pendingLabel="Updating invoice...">Save Invoice Status</SubmitButton>
                  </form>
                ) : (
                  <Notice tone="info">This invoice is already in a terminal state.</Notice>
                )
              ) : (
                <Notice tone="info">Only tenant owners and admins can update invoice status.</Notice>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Linked records</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-ink/8 bg-surface px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Subscription</p>
                {subscription ? (
                  <>
                    <p className="mt-2 font-medium text-ink">{subscription.plan.name}</p>
                    <p className="text-sm text-ink/55">
                      {formatEnumLabel(subscription.status)} • {subscription.seats} seats
                    </p>
                    <Link href="/billing/subscription" className="mt-3 inline-flex text-sm font-medium text-accent">
                      View Subscription
                    </Link>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-ink/60">No subscription linkage was found for this invoice.</p>
                )}
              </div>
              <div className="rounded-2xl border border-ink/8 bg-surface px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Billing cycle</p>
                {billingCycle ? (
                  <>
                    <p className="mt-2 font-medium text-ink">
                      {formatDateLabel(billingCycle.cycleStart)} to {formatDateLabel(billingCycle.cycleEnd)}
                    </p>
                    <p className="text-sm text-ink/55">
                      Invoice date {formatDateLabel(billingCycle.invoiceDate)} • Due {formatDateLabel(billingCycle.dueDate)}
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-ink/60">No billing cycle is linked to this invoice.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
