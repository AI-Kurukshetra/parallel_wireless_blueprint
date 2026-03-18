import { notFound } from "next/navigation";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSuperAdminAccess } from "@/lib/auth/access";
import type { Database } from "@/types/database";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type TenantRow = Database["public"]["Tables"]["tenants"]["Row"];

export async function getAdminUserDetail(userId: string) {
  await requireSuperAdminAccess();
  const supabase = createSupabaseAdminClient();

  const [profileResult, tenantsResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("tenants").select("*").order("name", { ascending: true })
  ]);

  if (profileResult.error) throw profileResult.error;
  if (tenantsResult.error) throw tenantsResult.error;

  const profile = profileResult.data as ProfileRow | null;
  if (!profile) notFound();

  const tenants = (tenantsResult.data ?? []) as TenantRow[];
  const tenantMap = new Map(tenants.map((tenant) => [tenant.id, tenant]));

  return {
    user: {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      role: profile.role,
      tenantId: profile.tenant_id,
      tenantName: profile.tenant_id ? tenantMap.get(profile.tenant_id)?.name ?? "Unknown tenant" : "No tenant",
      isActive: profile.is_active,
      isSuperAdmin: profile.is_super_admin,
      createdAt: profile.created_at
    },
    tenantOptions: tenants.map((tenant) => ({
      value: tenant.id,
      label: tenant.name
    }))
  };
}
