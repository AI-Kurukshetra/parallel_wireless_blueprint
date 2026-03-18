import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getDefaultTenant } from "@/lib/supabase/tenant";
import type { Database } from "@/types/database";

type ProfileRecord = Database["public"]["Tables"]["profiles"]["Row"];
type TenantRecord = Database["public"]["Tables"]["tenants"]["Row"];

type SignedOutAccess = {
  status: "signed_out";
};

type MissingProfileAccess = {
  status: "missing_profile";
  user: User;
};

type MissingTenantAccess = {
  status: "missing_tenant";
  user: User;
  profile: ProfileRecord;
};

type InactiveProfileAccess = {
  status: "inactive_profile";
  user: User;
  profile: ProfileRecord;
};

type InactiveTenantAccess = {
  status: "inactive_tenant";
  user: User;
  profile: ProfileRecord;
  tenant: TenantRecord;
};

type ReadyAccess = {
  status: "ready";
  user: User;
  profile: ProfileRecord;
  tenant: TenantRecord;
};

export type AppAccessState =
  | SignedOutAccess
  | MissingProfileAccess
  | MissingTenantAccess
  | InactiveProfileAccess
  | InactiveTenantAccess
  | ReadyAccess;

export const getAppAccessState = cache(async (): Promise<AppAccessState> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "signed_out" };
  }

  const admin = createSupabaseAdminClient();
  const profileResult = await admin.from("profiles").select("*").eq("id", user.id).maybeSingle();

  if (profileResult.error) {
    throw profileResult.error;
  }

  const profile = profileResult.data as ProfileRecord | null;

  if (!profile) {
    return {
      status: "missing_profile",
      user
    };
  }

  if (!profile.is_active) {
    return {
      status: "inactive_profile",
      user,
      profile
    };
  }

  if (!profile.tenant_id) {
    return {
      status: "missing_tenant",
      user,
      profile
    };
  }

  const tenantResult = await admin.from("tenants").select("*").eq("id", profile.tenant_id).maybeSingle();

  if (tenantResult.error) {
    throw tenantResult.error;
  }

  const tenant = tenantResult.data as TenantRecord | null;

  if (!tenant) {
    return {
      status: "missing_tenant",
      user,
      profile
    };
  }

  if (!tenant.is_active) {
    return {
      status: "inactive_tenant",
      user,
      profile,
      tenant
    };
  }

  return {
    status: "ready",
    user,
    profile,
    tenant
  };
});

export async function requireReadyAppAccess() {
  const access = await getAppAccessState();

  if (access.status === "signed_out") {
    redirect("/login");
  }

  if (access.status !== "ready") {
    throw new Error(`App access is not ready: ${access.status}`);
  }

  return access;
}

export async function getTenantContext(options?: { allowFallback?: boolean }) {
  const allowFallback = options?.allowFallback ?? false;
  const access = await getAppAccessState();

  if (access.status === "ready") {
    return {
      source: "authenticated" as const,
      tenant: access.tenant,
      profile: access.profile,
      user: access.user
    };
  }

  if (allowFallback && access.status === "signed_out") {
    const tenant = await getDefaultTenant();

    return {
      source: "fallback" as const,
      tenant,
      profile: null,
      user: null
    };
  }

  if (access.status === "signed_out") {
    redirect("/login");
  }

  throw new Error(`Tenant context unavailable: ${access.status}`);
}

export async function requireSuperAdminAccess() {
  const access = await getAppAccessState();

  if (access.status === "signed_out") {
    redirect("/login?next=/admin");
  }

  if (access.status === "missing_profile") {
    throw new Error("Super admin access requires an application profile.");
  }

  if (access.status === "inactive_profile") {
    throw new Error("This user profile is inactive.");
  }

  if ((access.status === "ready" || access.status === "missing_tenant" || access.status === "inactive_tenant") && access.profile.is_super_admin) {
    return {
      user: access.user,
      profile: access.profile,
      tenant: access.status === "ready" || access.status === "inactive_tenant" ? access.tenant : null
    };
  }

  throw new Error("Super admin access required.");
}

export function hasTenantRole(role: string | null | undefined, allowedRoles: string[]) {
  return Boolean(role && allowedRoles.includes(role));
}

export async function getDefaultSignedInPath() {
  const access = await getAppAccessState();

  if (
    (access.status === "ready" || access.status === "missing_tenant" || access.status === "inactive_tenant" || access.status === "inactive_profile") &&
    access.profile.is_super_admin
  ) {
    return "/admin";
  }

  return "/dashboard";
}

export async function getDefaultPathForUser(userId: string) {
  const admin = createSupabaseAdminClient();
  const profileResult = await admin.from("profiles").select("is_super_admin").eq("id", userId).maybeSingle();

  if (profileResult.error) {
    throw profileResult.error;
  }

  const profile = profileResult.data as Pick<ProfileRecord, "is_super_admin"> | null;
  return profile?.is_super_admin ? "/admin" : "/dashboard";
}
