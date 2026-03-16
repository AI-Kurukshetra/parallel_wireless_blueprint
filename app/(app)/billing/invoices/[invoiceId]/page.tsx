import { InvoiceDetailView } from "@/features/billing/components/invoice-detail-view";
import { getInvoiceDetail } from "@/features/billing/lib/get-invoice-detail";

export default async function InvoiceDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ invoiceId: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { invoiceId } = await params;
  const query = await searchParams;
  const detail = await getInvoiceDetail(invoiceId);

  return (
    <InvoiceDetailView
      invoice={detail.invoice}
      lineItems={detail.lineItems}
      billingCycle={detail.billingCycle}
      subscription={detail.subscription}
      canManageBilling={detail.canManageBilling}
      success={query.success}
      error={query.error}
    />
  );
}
