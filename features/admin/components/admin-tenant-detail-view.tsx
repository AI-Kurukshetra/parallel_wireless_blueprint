import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import type { getAdminTenantDetail } from "@/features/admin/lib/get-admin-tenant-detail";
import { formatDateLabel } from "@/lib/utils/dates";
import { formatEnumLabel } from "@/lib/utils/format";

export function AdminTenantDetailView({
  detail,
  success,
  error
}: {
  detail: Awaited<ReturnType<typeof getAdminTenantDetail>>;
  success?: string;
  error?: string;
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tenant detail"
        title={detail.tenant.name}
        description="Review tenant account status, footprint counts, and update platform account settings."
        action={
          <ButtonLink href="/admin/tenants" className="bg-white text-ink ring-1 ring-ink/10">
            Back to Tenants
          </ButtonLink>
        }
      />
      {success ? <Notice tone="success">{success}</Notice> : null}
      {error ? <Notice tone="error">{error}</Notice> : null}

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Tenant summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-surface px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Slug</p>
              <p className="mt-2 text-lg font-medium text-ink">{detail.tenant.slug}</p>
            </div>
            <div className="rounded-2xl bg-surface px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Status</p>
              <div className="mt-3">
                <Badge tone={detail.tenant.is_active ? "success" : "neutral"}>
                  {detail.tenant.is_active ? "active" : "inactive"}
                </Badge>
              </div>
            </div>
            <div className="rounded-2xl bg-surface px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Default region</p>
              <p className="mt-2 text-lg font-medium text-ink">{detail.tenant.default_region}</p>
            </div>
            <div className="rounded-2xl bg-surface px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Critical threshold</p>
              <p className="mt-2 text-lg font-medium text-ink">{detail.tenant.critical_alarm_threshold}</p>
            </div>
            <div className="rounded-2xl bg-surface px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Created</p>
              <p className="mt-2 text-lg font-medium text-ink">{formatDateLabel(detail.tenant.created_at)}</p>
            </div>
            <div className="rounded-2xl bg-surface px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Users</p>
              <p className="mt-2 text-lg font-medium text-ink">
                {detail.counts.activeUsers}/{detail.counts.users}
              </p>
            </div>
            <div className="rounded-2xl bg-surface px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Sites</p>
              <p className="mt-2 text-lg font-medium text-ink">{detail.counts.sites}</p>
            </div>
            <div className="rounded-2xl bg-surface px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Base stations</p>
              <p className="mt-2 text-lg font-medium text-ink">{detail.counts.baseStations}</p>
            </div>
            <div className="rounded-2xl bg-surface px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Alarms</p>
              <p className="mt-2 text-lg font-medium text-ink">{detail.counts.alarms}</p>
            </div>
            <div className="rounded-2xl bg-surface px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Invoices</p>
              <p className="mt-2 text-lg font-medium text-ink">{detail.counts.invoices}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ButtonLink href={`/admin/tenants/${detail.tenant.id}/edit`}>Edit Tenant</ButtonLink>
            <ButtonLink href="/admin/users" className="bg-white text-ink ring-1 ring-ink/10">
              Browse tenant users
            </ButtonLink>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Tenant users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {detail.users.length === 0 ? <Notice tone="info">No users are assigned to this tenant yet.</Notice> : null}
          {detail.users.map((user) => (
            <Link key={user.id} href={`/admin/users/${user.id}`} className="block rounded-2xl border border-ink/8 bg-surface px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{user.fullName ?? user.email ?? user.id}</p>
                  <p className="text-sm text-ink/55">{user.email ?? "No email"}</p>
                </div>
                <div className="text-right text-sm text-ink/55">
                  <p>{formatEnumLabel(user.role)}</p>
                  <p>{user.isActive ? "Active" : "Inactive"}</p>
                </div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
