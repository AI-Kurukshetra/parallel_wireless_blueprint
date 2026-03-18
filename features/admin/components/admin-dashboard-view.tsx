import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { getAdminDashboardData } from "@/features/admin/lib/get-admin-dashboard-data";
import { formatDateTimeLabel, formatRelativeTime } from "@/lib/utils/dates";
import { formatEnumLabel } from "@/lib/utils/format";

export async function AdminDashboardView() {
  const data = await getAdminDashboardData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Platform control"
        title="Super Admin"
        description="High-level platform visibility across tenant accounts and application users."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total tenants" value={String(data.totals.tenants)} trend={`${data.totals.activeTenants} active`} trendDirection="neutral" />
        <StatCard label="Active tenants" value={String(data.totals.activeTenants)} trend="Platform accounts" trendDirection="up" />
        <StatCard label="Total users" value={String(data.totals.users)} trend={`${data.totals.activeUsers} active`} trendDirection="neutral" />
        <StatCard label="Active users" value={String(data.totals.activeUsers)} trend="Profile access enabled" trendDirection="up" />
        <StatCard label="Super admins" value={String(data.totals.superAdmins)} trend="Platform operators" trendDirection="neutral" />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent tenants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentTenants.map((tenant) => (
              <Link key={tenant.id} href={`/admin/tenants/${tenant.id}`} className="block rounded-2xl border border-ink/8 bg-surface px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">{tenant.name}</p>
                    <p className="text-sm text-ink/55">{tenant.slug}</p>
                  </div>
                  <p className="text-sm text-ink/55">{tenant.is_active ? "active" : "inactive"}</p>
                </div>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-ink/40">{formatDateTimeLabel(tenant.created_at)}</p>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentUsers.map((user) => (
              <Link key={user.id} href={`/admin/users/${user.id}`} className="block rounded-2xl border border-ink/8 bg-surface px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">{user.fullName ?? user.email ?? user.id}</p>
                    <p className="text-sm text-ink/55">
                      {user.email ?? "No email"} • {user.tenantName}
                    </p>
                  </div>
                  <p className="text-sm text-ink/55">{formatEnumLabel(user.role)}</p>
                </div>
                <p className="mt-2 text-sm text-ink/60">
                  {user.isSuperAdmin ? "Super admin" : "Tenant-scoped"} • {user.isActive ? "Active" : "Inactive"}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-ink/40">{formatRelativeTime(user.createdAt)}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
