import { BillingPageView } from "@/features/billing/components/billing-page-view";

export default async function BillingPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string; sort?: string; success?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <BillingPageView
      filters={{
        status: params.status as never,
        sort: params.sort as never
      }}
      success={params.success}
      error={params.error}
    />
  );
}
