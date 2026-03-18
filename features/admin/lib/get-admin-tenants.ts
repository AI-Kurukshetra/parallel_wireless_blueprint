import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSuperAdminAccess } from "@/lib/auth/access";
import type { Database } from "@/types/database";

type TenantRow = Database["public"]["Tables"]["tenants"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];

export async function getAdminTenants() {
  await requireSuperAdminAccess();
  const supabase = createSupabaseAdminClient();

  const [tenantsResult, profilesResult, subscriptionsResult] = await Promise.all([
    supabase.from("tenants").select("*").order("created_at", { ascending: false }),
    supabase.from("profiles").select("*"),
    supabase.from("subscriptions").select("*")
  ]);

  if (tenantsResult.error) throw tenantsResult.error;
  if (profilesResult.error) throw profilesResult.error;
  if (subscriptionsResult.error) throw subscriptionsResult.error;

  const tenants = (tenantsResult.data ?? []) as TenantRow[];
  const profiles = (profilesResult.data ?? []) as ProfileRow[];
  const subscriptions = (subscriptionsResult.data ?? []) as SubscriptionRow[];

  return tenants.map((tenant) => ({
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    defaultRegion: tenant.default_region,
    criticalAlarmThreshold: tenant.critical_alarm_threshold,
    isActive: tenant.is_active,
    createdAt: tenant.created_at,
    userCount: profiles.filter((profile) => profile.tenant_id === tenant.id).length,
    activeUserCount: profiles.filter((profile) => profile.tenant_id === tenant.id && profile.is_active).length,
    hasSubscription: subscriptions.some((subscription) => subscription.tenant_id === tenant.id)
  }));
}
