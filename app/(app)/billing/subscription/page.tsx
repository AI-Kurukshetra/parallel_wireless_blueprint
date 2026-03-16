import { SubscriptionDetailView } from "@/features/billing/components/subscription-detail-view";
import { getBillingOverview } from "@/features/billing/lib/get-billing-overview";

export default async function SubscriptionPage({
  searchParams
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const params = await searchParams;
  const overview = await getBillingOverview();

  return (
    <SubscriptionDetailView
      subscription={overview.subscription}
      plans={overview.plans}
      billingCycles={overview.billingCycles}
      canManageBilling={overview.canManageBilling}
      success={params.success}
      error={params.error}
    />
  );
}
