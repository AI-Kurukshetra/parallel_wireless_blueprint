import { notFound } from "next/navigation";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSuperAdminAccess } from "@/lib/auth/access";
import type { Database } from "@/types/database";

type TenantRow = Database["public"]["Tables"]["tenants"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export async function getAdminTenantDetail(tenantId: string) {
  await requireSuperAdminAccess();
  const supabase = createSupabaseAdminClient();

  const [tenantResult, profilesResult, sitesResult, stationsResult, alarmsResult, invoicesResult] = await Promise.all([
    supabase.from("tenants").select("*").eq("id", tenantId).maybeSingle(),
    supabase.from("profiles").select("*").eq("tenant_id", tenantId).order("created_at", { ascending: false }),
    supabase.from("sites").select("id").eq("tenant_id", tenantId),
    supabase.from("base_stations").select("id").eq("tenant_id", tenantId),
    supabase.from("alarms").select("id").eq("tenant_id", tenantId),
    supabase.from("invoices").select("id").eq("tenant_id", tenantId)
  ]);

  if (tenantResult.error) throw tenantResult.error;
  if (profilesResult.error) throw profilesResult.error;
  if (sitesResult.error) throw sitesResult.error;
  if (stationsResult.error) throw stationsResult.error;
  if (alarmsResult.error) throw alarmsResult.error;
  if (invoicesResult.error) throw invoicesResult.error;

  const tenant = tenantResult.data as TenantRow | null;
  if (!tenant) notFound();

  const profiles = (profilesResult.data ?? []) as ProfileRow[];

  return {
    tenant,
    users: profiles.map((profile) => ({
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      role: profile.role,
      isActive: profile.is_active,
      isSuperAdmin: profile.is_super_admin
    })),
    counts: {
      users: profiles.length,
      activeUsers: profiles.filter((profile) => profile.is_active).length,
      sites: (sitesResult.data ?? []).length,
      baseStations: (stationsResult.data ?? []).length,
      alarms: (alarmsResult.data ?? []).length,
      invoices: (invoicesResult.data ?? []).length
    }
  };
}
