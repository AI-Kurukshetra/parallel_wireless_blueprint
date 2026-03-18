import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import type { getAdminUserDetail } from "@/features/admin/lib/get-admin-user-detail";
import { formatDateLabel } from "@/lib/utils/dates";
import { formatEnumLabel } from "@/lib/utils/format";

export function AdminUserDetailView({
  detail,
  success,
  error
}: {
  detail: Awaited<ReturnType<typeof getAdminUserDetail>>;
  success?: string;
  error?: string;
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="User detail"
        title={detail.user.fullName ?? detail.user.email ?? detail.user.id}
        description="Review and update the application profile linked to this auth user."
        action={
          <ButtonLink href="/admin/users" className="bg-white text-ink ring-1 ring-ink/10">
            Back to Users
          </ButtonLink>
        }
      />
      {success ? <Notice tone="success">{success}</Notice> : null}
      {error ? <Notice tone="error">{error}</Notice> : null}

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>User summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-surface px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Email</p>
              <p className="mt-2 text-lg font-medium text-ink">{detail.user.email ?? "No email"}</p>
            </div>
            <div className="rounded-2xl bg-surface px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Tenant</p>
              <p className="mt-2 text-lg font-medium text-ink">{detail.user.tenantName}</p>
            </div>
            <div className="rounded-2xl bg-surface px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Role</p>
              <p className="mt-2 text-lg font-medium text-ink">{formatEnumLabel(detail.user.role)}</p>
            </div>
            <div className="rounded-2xl bg-surface px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Platform access</p>
              <p className="mt-2 text-lg font-medium text-ink">{detail.user.isSuperAdmin ? "Super admin" : "Tenant user"}</p>
            </div>
            <div className="rounded-2xl bg-surface px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Profile status</p>
              <p className="mt-2 text-lg font-medium text-ink">{detail.user.isActive ? "Active" : "Inactive"}</p>
            </div>
            <div className="rounded-2xl bg-surface px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Created</p>
              <p className="mt-2 text-lg font-medium text-ink">{formatDateLabel(detail.user.createdAt)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Notice tone="info">
              Password resets and auth-user deletion remain manually manageable from Supabase if needed.
            </Notice>
            <ButtonLink href={`/admin/users/${detail.user.id}/edit`}>Edit User</ButtonLink>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
