import { AdminUsersPageView } from "@/features/admin/components/admin-users-page-view";

export default async function AdminUsersPage({
  searchParams
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const params = await searchParams;

  return <AdminUsersPageView success={params.success} error={params.error} />;
}
