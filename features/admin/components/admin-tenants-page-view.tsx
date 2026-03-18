import Link from "next/link";

import { DataTable } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { getAdminTenants } from "@/features/admin/lib/get-admin-tenants";
import { formatDateLabel } from "@/lib/utils/dates";

export async function AdminTenantsPageView({
  success,
  error
}: {
  success?: string;
  error?: string;
}) {
  const tenants = await getAdminTenants();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Platform tenants"
        title="Tenants"
        description="Create and manage tenant accounts, lifecycle status, and platform-level metadata."
        action={<ButtonLink href="/admin/tenants/new">Create Tenant</ButtonLink>}
      />
      {success ? <Notice tone="success">{success}</Notice> : null}
      {error ? <Notice tone="error">{error}</Notice> : null}

      <section className="space-y-4">
        <DataTable title="Tenant directory" columns={["Tenant", "Region", "Users", "Subscription", "Status", "Actions"]}>
          {tenants.map((tenant) => (
            <tr key={tenant.id} className="bg-white">
              <td className="rounded-l-2xl px-4 py-4">
                <p className="font-medium text-ink">{tenant.name}</p>
                <p className="text-xs text-ink/50">{tenant.slug}</p>
              </td>
              <td className="px-4 py-4 text-sm text-ink/65">{tenant.defaultRegion}</td>
              <td className="px-4 py-4 text-sm text-ink/65">
                {tenant.activeUserCount}/{tenant.userCount}
              </td>
              <td className="px-4 py-4 text-sm text-ink/65">{tenant.hasSubscription ? "Configured" : "Not configured"}</td>
              <td className="px-4 py-4">
                <Badge tone={tenant.isActive ? "success" : "neutral"}>{tenant.isActive ? "active" : "inactive"}</Badge>
              </td>
              <td className="rounded-r-2xl px-4 py-4 text-sm">
                <Link href={`/admin/tenants/${tenant.id}`} className="font-medium text-accent">
                  View Tenant
                </Link>
              </td>
            </tr>
          ))}
        </DataTable>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Recent tenant creation</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {tenants.slice(0, 6).map((tenant) => (
            <div key={tenant.id} className="rounded-2xl border border-ink/8 bg-surface px-4 py-4">
              <p className="font-medium text-ink">{tenant.name}</p>
              <p className="text-sm text-ink/55">{tenant.slug}</p>
              <p className="mt-2 text-sm text-ink/60">Created {formatDateLabel(tenant.createdAt)}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
