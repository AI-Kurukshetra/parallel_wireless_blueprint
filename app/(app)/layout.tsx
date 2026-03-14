import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AccessFallback } from "@/components/layout/access-fallback";
import { AppShell } from "@/components/layout/app-shell";
import { getAppAccessState } from "@/lib/auth/access";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const access = await getAppAccessState();

  if (access.status === "signed_out") {
    redirect("/login");
  }

  if (access.status === "missing_profile") {
    return (
      <AccessFallback
        title="Your account is not linked to an application profile yet."
        description="Your Supabase auth user exists, but no application profile was found. Create the user with tenant metadata or assign a profile row in the database."
        email={access.user.email}
      />
    );
  }

  if (access.status === "missing_tenant") {
    return (
      <AccessFallback
        title="Your account does not have a tenant assignment."
        description="Assign a tenant to this user profile before accessing tenant-scoped operational data."
        email={access.user.email}
      />
    );
  }

  return (
    <AppShell
      viewer={{
        name: access.profile.full_name ?? access.user.email ?? "Operator",
        tenantName: access.tenant.name,
        role: access.profile.role
      }}
    >
      {children}
    </AppShell>
  );
}
