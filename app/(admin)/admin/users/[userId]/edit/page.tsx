import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button-link";
import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { UserForm } from "@/features/admin/components/user-form";
import { UserPasswordForm } from "@/features/admin/components/user-password-form";
import { updateAdminUserAction, updateAdminUserPasswordAction } from "@/features/admin/lib/actions";
import { getAdminUserDetail } from "@/features/admin/lib/get-admin-user-detail";

export default async function AdminUserEditPage({
  params,
  searchParams
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { userId } = await params;
  const query = await searchParams;
  const detail = await getAdminUserDetail(userId);
  const updateProfileAction = updateAdminUserAction.bind(null, detail.user.id);
  const updatePasswordAction = updateAdminUserPasswordAction.bind(null, detail.user.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Edit user"
        title={detail.user.fullName ?? detail.user.email ?? detail.user.id}
        description="Update application profile fields and reset this user’s password from a server-side admin workflow."
        action={
          <ButtonLink href={`/admin/users/${detail.user.id}`} className="bg-white text-ink ring-1 ring-ink/10">
            Back to User
          </ButtonLink>
        }
      />
      {query.success ? <Notice tone="success">{query.success}</Notice> : null}
      {query.error ? <Notice tone="error">{query.error}</Notice> : null}

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Profile details</CardTitle>
          </CardHeader>
          <CardContent>
            <UserForm
              action={updateProfileAction}
              tenantOptions={detail.tenantOptions}
              submitLabel="Save User"
              defaultValues={{
                email: detail.user.email ?? "",
                fullName: detail.user.fullName ?? "",
                tenantId: detail.user.tenantId ?? "",
                role: detail.user.role as "owner" | "admin" | "operator" | "viewer",
                isActive: detail.user.isActive,
                isSuperAdmin: detail.user.isSuperAdmin
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Notice tone="info">
              This updates the auth credential server-side using Supabase admin APIs. The service-role key never reaches the browser.
            </Notice>
            <UserPasswordForm action={updatePasswordAction} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
