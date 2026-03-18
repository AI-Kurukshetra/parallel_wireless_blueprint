import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSuperAdminAccess } from "@/lib/auth/access";
import type { Database } from "@/types/database";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type TenantRow = Database["public"]["Tables"]["tenants"]["Row"];

export async function getAdminUsers() {
  await requireSuperAdminAccess();
  const supabase = createSupabaseAdminClient();

  const [profilesResult, tenantsResult] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("tenants").select("*").order("name", { ascending: true })
  ]);

  if (profilesResult.error) throw profilesResult.error;
  if (tenantsResult.error) throw tenantsResult.error;

  const profiles = (profilesResult.data ?? []) as ProfileRow[];
  const tenants = (tenantsResult.data ?? []) as TenantRow[];
  const tenantMap = new Map(tenants.map((tenant) => [tenant.id, tenant]));

  return {
    users: profiles.map((profile) => ({
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      role: profile.role,
      isActive: profile.is_active,
      isSuperAdmin: profile.is_super_admin,
      tenantId: profile.tenant_id,
      tenantName: profile.tenant_id ? tenantMap.get(profile.tenant_id)?.name ?? "Unknown tenant" : "No tenant",
      createdAt: profile.created_at
    })),
    tenantOptions: tenants.map((tenant) => ({
      value: tenant.id,
      label: tenant.name
    }))
  };
}
