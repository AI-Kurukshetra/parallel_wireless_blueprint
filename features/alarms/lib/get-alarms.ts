import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getTenantContext } from "@/lib/auth/access";
import { mapAlarm } from "@/features/alarms/lib/alarm-utils";
import type { AlarmStatus, Severity } from "@/types/domain";
import type { Database } from "@/types/database";

type AlarmRow = Database["public"]["Tables"]["alarms"]["Row"];
type SiteRow = Pick<Database["public"]["Tables"]["sites"]["Row"], "id" | "name">;
type BaseStationRow = Pick<Database["public"]["Tables"]["base_stations"]["Row"], "id" | "code">;
type ProfileRow = Pick<Database["public"]["Tables"]["profiles"]["Row"], "id" | "full_name" | "email">;

export type AlarmListFilters = {
  severity?: Severity | "all";
  status?: AlarmStatus | "all";
  siteId?: string;
  baseStationId?: string;
  search?: string;
  sort?: "newest" | "oldest" | "severity" | "status";
};

export async function getAlarms(filters: AlarmListFilters = {}) {
  const supabase = createSupabaseAdminClient();
  const { tenant } = await getTenantContext();

  let query = supabase.from("alarms").select("*").eq("tenant_id", tenant.id);

  if (filters.severity && filters.severity !== "all") {
    query = query.eq("severity", filters.severity);
  }

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.siteId) {
    query = query.eq("site_id", filters.siteId);
  }

  if (filters.baseStationId) {
    query = query.eq("base_station_id", filters.baseStationId);
  }

  switch (filters.sort) {
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;
    case "severity":
    case "status":
      query = query.order("created_at", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  const [alarmsResult, sitesResult, stationsResult, profilesResult] = await Promise.all([
    query,
    supabase.from("sites").select("id, name").eq("tenant_id", tenant.id).order("name", { ascending: true }),
    supabase.from("base_stations").select("id, code").eq("tenant_id", tenant.id).order("code", { ascending: true }),
    supabase.from("profiles").select("id, full_name, email").eq("tenant_id", tenant.id)
  ]);

  if (alarmsResult.error) throw alarmsResult.error;
  if (sitesResult.error) throw sitesResult.error;
  if (stationsResult.error) throw stationsResult.error;
  if (profilesResult.error) throw profilesResult.error;

  const alarms = (alarmsResult.data ?? []) as AlarmRow[];
  const sites = (sitesResult.data ?? []) as SiteRow[];
  const stations = (stationsResult.data ?? []) as BaseStationRow[];
  const profiles = (profilesResult.data ?? []) as ProfileRow[];

  const mappedAlarms = alarms.map((alarm) => mapAlarm(alarm, sites, stations, profiles));

  const searchedAlarms = filters.search?.trim()
    ? mappedAlarms.filter((alarm) => {
        const term = filters.search?.trim().toLowerCase() ?? "";
        return [
          alarm.title,
          alarm.message,
          alarm.description,
          alarm.sourceVendor,
          alarm.siteName,
          alarm.baseStationCode
        ]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(term));
      })
    : mappedAlarms;

  const severityRank = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
  };

  const sortedAlarms = [...searchedAlarms].sort((left, right) => {
    if (filters.sort === "severity") {
      return severityRank[right.severity] - severityRank[left.severity];
    }

    if (filters.sort === "status") {
      return left.status.localeCompare(right.status);
    }

    if (filters.sort === "oldest") {
      return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
    }

    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });

  return {
    alarms: sortedAlarms,
    filters: {
      sites: sites.map((site) => ({ label: site.name, value: site.id })),
      baseStations: stations.map((station) => ({ label: station.code, value: station.id }))
    }
  };
}
