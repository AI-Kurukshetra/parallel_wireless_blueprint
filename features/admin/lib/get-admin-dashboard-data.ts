import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSuperAdminAccess } from "@/lib/auth/access";
import type { Database } from "@/types/database";

type TenantRow = Database["public"]["Tables"]["tenants"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export async function getAdminDashboardData() {
  await requireSuperAdminAccess();
  const supabase = createSupabaseAdminClient();

  const [tenantsResult, profilesResult] = await Promise.all([
    supabase.from("tenants").select("*").order("created_at", { ascending: false }),
    supabase.from("profiles").select("*").order("created_at", { ascending: false })
  ]);

  if (tenantsResult.error) throw tenantsResult.error;
  if (profilesResult.error) throw profilesResult.error;

  const tenants = (tenantsResult.data ?? []) as TenantRow[];
  const profiles = (profilesResult.data ?? []) as ProfileRow[];
  const tenantMap = new Map(tenants.map((tenant) => [tenant.id, tenant]));

  return {
    totals: {
      tenants: tenants.length,
      activeTenants: tenants.filter((tenant) => tenant.is_active).length,
      users: profiles.length,
      activeUsers: profiles.filter((profile) => profile.is_active).length,
      superAdmins: profiles.filter((profile) => profile.is_super_admin).length
    },
    recentTenants: tenants.slice(0, 5),
    recentUsers: profiles.slice(0, 6).map((profile) => ({
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      role: profile.role,
      isActive: profile.is_active,
      isSuperAdmin: profile.is_super_admin,
      tenantName: profile.tenant_id ? tenantMap.get(profile.tenant_id)?.name ?? "Unknown tenant" : "No tenant",
      createdAt: profile.created_at
    }))
  };
}
