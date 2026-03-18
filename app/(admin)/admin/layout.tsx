import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AccessFallback } from "@/components/layout/access-fallback";
import { AdminShell } from "@/components/layout/admin-shell";
import { getAppAccessState } from "@/lib/auth/access";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const access = await getAppAccessState();

  if (access.status === "signed_out") {
    redirect("/login?next=/admin");
  }

  if (access.status === "missing_profile") {
    return (
      <AccessFallback
        title="Your account is not linked to an application profile yet."
        description="A super admin profile is required before you can access platform management."
        email={access.user.email}
      />
    );
  }

  if (access.status === "inactive_profile") {
    return (
      <AccessFallback
        title="Your account has been deactivated."
        description="This profile has been disabled by the platform. Contact another super admin if you still need access."
        email={access.user.email}
      />
    );
  }

  if (!access.profile.is_super_admin) {
    return (
      <AccessFallback
        title="You do not have access to the super admin console."
        description="Only platform super admins can access tenant and user management routes."
        email={access.user.email}
      />
    );
  }

  return (
    <AdminShell
      viewer={{
        name: access.profile.full_name ?? access.user.email ?? "Super Admin",
        role: "super_admin"
      }}
    >
      {children}
    </AdminShell>
  );
}
