import Link from "next/link";

import { updateSubscriptionAction } from "@/features/billing/lib/actions";
import type { BillingCycle, SubscriptionPlan, SubscriptionSummary } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { SubmitButton } from "@/components/forms/submit-button";
import { formatDateLabel } from "@/lib/utils/dates";
import { formatCurrency } from "@/lib/utils/format";

export function SubscriptionDetailView({
  subscription,
  plans,
  billingCycles,
  canManageBilling,
  success,
  error
}: {
  subscription: SubscriptionSummary | null;
  plans: SubscriptionPlan[];
  billingCycles: BillingCycle[];
  canManageBilling: boolean;
  success?: string;
  error?: string;
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tenant subscription"
        title="Subscription"
        description="Inspect current entitlements, subscription lifecycle state, and manual tenant subscription updates."
        action={
          <ButtonLink href="/billing" className="bg-white text-ink ring-1 ring-ink/10">
            Back to Billing
          </ButtonLink>
        }
      />
      {success ? <Notice tone="success">{success}</Notice> : null}
      {error ? <Notice tone="error">{error}</Notice> : null}

      {!subscription ? <Notice tone="info">No subscription exists for this tenant yet.</Notice> : null}

      {subscription ? (
        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Subscription summary</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-surface px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Current plan</p>
                  <p className="mt-2 text-lg font-medium text-ink">{subscription.plan.name}</p>
                  <p className="text-sm text-ink/55">
                    {formatCurrency(subscription.plan.basePrice, subscription.plan.currency)} /{" "}
                    {subscription.plan.billingInterval}
                  </p>
                </div>
                <div className="rounded-2xl bg-surface px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Status</p>
                  <div className="mt-3">
                    <Badge tone={subscription.status === "active" ? "success" : "warning"}>
                      {subscription.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
                <div className="rounded-2xl bg-surface px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Billing window</p>
                  <p className="mt-2 text-lg font-medium text-ink">
                    {subscription.currentPeriodStart && subscription.currentPeriodEnd
                      ? `${formatDateLabel(subscription.currentPeriodStart)} to ${formatDateLabel(subscription.currentPeriodEnd)}`
                      : "Not available"}
                  </p>
                </div>
                <div className="rounded-2xl bg-surface px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Renewal</p>
                  <p className="mt-2 text-lg font-medium text-ink">{formatDateLabel(subscription.renewsAt)}</p>
                </div>
                <div className="rounded-2xl bg-surface px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Started</p>
                  <p className="mt-2 text-lg font-medium text-ink">{formatDateLabel(subscription.startedAt)}</p>
                </div>
                <div className="rounded-2xl bg-surface px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Seats</p>
                  <p className="mt-2 text-lg font-medium text-ink">{subscription.seats}</p>
                </div>
                <div className="rounded-2xl bg-surface px-4 py-4 md:col-span-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Entitlements foundation</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge tone="info">{subscription.plan.siteLimit} site limit</Badge>
                    <Badge tone="info">{subscription.plan.baseStationLimit} base station limit</Badge>
                    <Badge tone="neutral">{subscription.plan.supportTier} support</Badge>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-ink/65 md:grid-cols-2">
                    {Object.entries(subscription.plan.featureSummary).map(([key, value]) => (
                      <p key={key} className="capitalize">
                        {key.replace(/_/g, " ")}: {value}
                      </p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing cycle visibility</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {billingCycles.length === 0 ? <Notice tone="info">No billing cycles are available for this subscription yet.</Notice> : null}
                {billingCycles.map((cycle) => (
                  <div key={cycle.id} className="rounded-2xl border border-ink/8 bg-surface px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-ink">
                        {formatDateLabel(cycle.cycleStart)} to {formatDateLabel(cycle.cycleEnd)}
                      </p>
                      <Badge tone={cycle.status === "paid" || cycle.status === "closed" ? "success" : cycle.status === "overdue" ? "warning" : "info"}>
                        {cycle.status}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-ink/60">
                      Invoice date {formatDateLabel(cycle.invoiceDate)} • Due {formatDateLabel(cycle.dueDate)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manual subscription update</CardTitle>
              </CardHeader>
              <CardContent>
                {canManageBilling ? (
                  <form action={updateSubscriptionAction} className="space-y-4">
                    <label className="grid gap-2 text-sm text-ink/70">
                      <span className="font-medium text-ink">Plan</span>
                      <select
                        name="planId"
                        defaultValue={subscription.plan.id}
                        className="rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none transition focus:border-accent"
                      >
                        {plans.filter((plan) => plan.isActive).map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.name} ({formatCurrency(plan.basePrice, plan.currency)}/{plan.billingInterval})
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-2 text-sm text-ink/70">
                      <span className="font-medium text-ink">Status</span>
                      <select
                        name="status"
                        defaultValue={subscription.status}
                        className="rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none transition focus:border-accent"
                      >
                        <option value="trialing">Trialing</option>
                        <option value="active">Active</option>
                        <option value="past_due">Past due</option>
                        <option value="canceled">Canceled</option>
                      </select>
                    </label>
                    <label className="grid gap-2 text-sm text-ink/70">
                      <span className="font-medium text-ink">Seats</span>
                      <input
                        type="number"
                        min={1}
                        name="seats"
                        defaultValue={subscription.seats}
                        className="rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none transition focus:border-accent"
                      />
                    </label>
                    <SubmitButton pendingLabel="Saving subscription...">Save Subscription</SubmitButton>
                  </form>
                ) : (
                  <Notice tone="info">Only tenant owners and admins can update subscription details.</Notice>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/billing" className="block rounded-2xl border border-ink/10 bg-surface px-4 py-4 text-sm font-medium text-accent">
                  Back to billing overview
                </Link>
                <Link href="/settings" className="block rounded-2xl border border-ink/10 bg-surface px-4 py-4 text-sm font-medium text-accent">
                  Review tenant settings
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}
