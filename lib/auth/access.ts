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

export function hasTenantRole(role: string | null | undefined, allowedRoles: string[]) {
  return Boolean(role && allowedRoles.includes(role));
}
