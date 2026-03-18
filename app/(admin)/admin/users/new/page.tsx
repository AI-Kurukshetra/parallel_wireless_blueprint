import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button-link";
import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { UserForm } from "@/features/admin/components/user-form";
import { createAdminUserAction } from "@/features/admin/lib/actions";
import { getAdminUsers } from "@/features/admin/lib/get-admin-users";

export default async function AdminUserNewPage() {
  const data = await getAdminUsers();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Create user"
        title="New User"
        description="Create a real Supabase Auth user and the linked application profile in one flow."
        action={
          <ButtonLink href="/admin/users" className="bg-white text-ink ring-1 ring-ink/10">
            Back to Users
          </ButtonLink>
        }
      />

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>User details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Notice tone="info">
            The password set here is a direct auth credential. Resets can also be handled later from the admin edit page or Supabase dashboard.
          </Notice>
          <UserForm
            action={createAdminUserAction}
            tenantOptions={data.tenantOptions}
            submitLabel="Create User"
            includePassword
          />
        </CardContent>
      </Card>
    </div>
  );
}
