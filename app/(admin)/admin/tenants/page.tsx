import { AdminTenantsPageView } from "@/features/admin/components/admin-tenants-page-view";

export default async function AdminTenantsPage({
  searchParams
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const params = await searchParams;

  return <AdminTenantsPageView success={params.success} error={params.error} />;
}
