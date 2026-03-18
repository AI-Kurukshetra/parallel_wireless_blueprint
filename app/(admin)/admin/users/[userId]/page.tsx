import { AdminUserDetailView } from "@/features/admin/components/admin-user-detail-view";
import { getAdminUserDetail } from "@/features/admin/lib/get-admin-user-detail";

export default async function AdminUserDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { userId } = await params;
  const query = await searchParams;
  const detail = await getAdminUserDetail(userId);

  return <AdminUserDetailView detail={detail} success={query.success} error={query.error} />;
}
