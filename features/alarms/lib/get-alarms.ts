import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getTenantContext } from "@/lib/auth/access";
import type { Alarm } from "@/types/domain";
import type { Database } from "@/types/database";

type AlarmRow = Database["public"]["Tables"]["alarms"]["Row"];
type SiteLookupRow = Pick<Database["public"]["Tables"]["sites"]["Row"], "id" | "name">;

export async function getAlarms(): Promise<Alarm[]> {
  const supabase = createSupabaseAdminClient();
  const { tenant } = await getTenantContext();

  const [alarmsResult, sitesResult] = await Promise.all([
    supabase.from("alarms").select("*").eq("tenant_id", tenant.id).order("created_at", { ascending: false }),
    supabase.from("sites").select("id, name").eq("tenant_id", tenant.id)
  ]);

  if (alarmsResult.error) throw alarmsResult.error;
  if (sitesResult.error) throw sitesResult.error;

  const alarmRows = (alarmsResult.data ?? []) as AlarmRow[];
  const siteRows = (sitesResult.data ?? []) as SiteLookupRow[];
  const siteMap = new Map(siteRows.map((site) => [site.id, site.name]));

  return alarmRows.map((alarm) => ({
    id: alarm.id,
    title: alarm.title,
    siteName: siteMap.get(alarm.site_id) ?? "Unknown site",
    severity: alarm.severity,
    category: alarm.category,
    createdAt: alarm.created_at,
    acknowledged: alarm.acknowledged
  }));
}
