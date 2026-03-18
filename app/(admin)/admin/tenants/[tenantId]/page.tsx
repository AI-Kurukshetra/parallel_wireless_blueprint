import { AdminTenantDetailView } from "@/features/admin/components/admin-tenant-detail-view";
import { getAdminTenantDetail } from "@/features/admin/lib/get-admin-tenant-detail";

export default async function AdminTenantDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ tenantId: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { tenantId } = await params;
  const query = await searchParams;
  const detail = await getAdminTenantDetail(tenantId);

  return <AdminTenantDetailView detail={detail} success={query.success} error={query.error} />;
}
