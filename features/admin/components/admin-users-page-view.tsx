import Link from "next/link";

import { DataTable } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { getAdminUsers } from "@/features/admin/lib/get-admin-users";
import { formatEnumLabel } from "@/lib/utils/format";

export async function AdminUsersPageView({
  success,
  error
}: {
  success?: string;
  error?: string;
}) {
  const data = await getAdminUsers();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Platform users"
        title="Users"
        description="Manage application users, tenant assignment, tenant role, and platform super admin flags."
        action={<ButtonLink href="/admin/users/new">Create User</ButtonLink>}
      />
      {success ? <Notice tone="success">{success}</Notice> : null}
      {error ? <Notice tone="error">{error}</Notice> : null}

      <section className="space-y-4">
        <DataTable title="User directory" columns={["User", "Tenant", "Role", "Status", "Platform", "Actions"]}>
          {data.users.map((user) => (
            <tr key={user.id} className="bg-white">
              <td className="rounded-l-2xl px-4 py-4">
                <p className="font-medium text-ink">{user.fullName ?? user.email ?? user.id}</p>
                <p className="text-xs text-ink/50">{user.email ?? "No email"}</p>
              </td>
              <td className="px-4 py-4 text-sm text-ink/65">{user.tenantName}</td>
              <td className="px-4 py-4 text-sm text-ink/65">{formatEnumLabel(user.role)}</td>
              <td className="px-4 py-4">
                <Badge tone={user.isActive ? "success" : "neutral"}>{user.isActive ? "active" : "inactive"}</Badge>
              </td>
              <td className="px-4 py-4 text-sm text-ink/65">{user.isSuperAdmin ? "Super admin" : "Tenant user"}</td>
              <td className="rounded-r-2xl px-4 py-4 text-sm">
                <Link href={`/admin/users/${user.id}`} className="font-medium text-accent">
                  View User
                </Link>
              </td>
            </tr>
          ))}
        </DataTable>
      </section>
    </div>
  );
}
