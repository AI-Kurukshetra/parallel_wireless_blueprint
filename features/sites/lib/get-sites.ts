import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getTenantContext } from "@/lib/auth/access";
import type { Site } from "@/types/domain";
import type { Database } from "@/types/database";

type SiteRow = Database["public"]["Tables"]["sites"]["Row"];

export async function getSites(): Promise<Site[]> {
  const supabase = createSupabaseAdminClient();
  const { tenant } = await getTenantContext();

  const { data, error } = await supabase
    .from("sites")
    .select("*")
    .eq("tenant_id", tenant.id)
    .order("region", { ascending: true });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as SiteRow[];

  return rows.map((site) => ({
    id: site.id,
    name: site.name,
    region: site.region,
    uptime: Number(site.uptime),
    subscribers: site.subscribers,
    status: site.status,
    technology: site.technology
  }));
}
