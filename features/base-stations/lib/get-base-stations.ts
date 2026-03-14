import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getTenantContext } from "@/lib/auth/access";
import type { BaseStation } from "@/types/domain";
import type { Database } from "@/types/database";

type BaseStationRow = Database["public"]["Tables"]["base_stations"]["Row"];
type SiteLookupRow = Pick<Database["public"]["Tables"]["sites"]["Row"], "id" | "name">;

export async function getBaseStations(): Promise<BaseStation[]> {
  const supabase = createSupabaseAdminClient();
  const { tenant } = await getTenantContext();

  const [stationsResult, sitesResult] = await Promise.all([
    supabase.from("base_stations").select("*").eq("tenant_id", tenant.id).order("code", { ascending: true }),
    supabase.from("sites").select("id, name").eq("tenant_id", tenant.id)
  ]);

  if (stationsResult.error) throw stationsResult.error;
  if (sitesResult.error) throw sitesResult.error;

  const stationRows = (stationsResult.data ?? []) as BaseStationRow[];
  const siteRows = (sitesResult.data ?? []) as SiteLookupRow[];
  const siteMap = new Map(siteRows.map((site) => [site.id, site.name]));

  return stationRows.map((station) => ({
    id: station.id,
    code: station.code,
    siteName: siteMap.get(station.site_id) ?? "Unknown site",
    vendor: station.vendor,
    powerLevel: station.power_level,
    backhaulUsage: station.backhaul_usage,
    status: station.status
  }));
}
