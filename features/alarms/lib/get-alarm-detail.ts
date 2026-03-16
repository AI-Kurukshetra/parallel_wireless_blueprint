import { notFound } from "next/navigation";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getTenantContext } from "@/lib/auth/access";
import { mapAlarm, mapAlarmEvent, mapAlarmNote } from "@/features/alarms/lib/alarm-utils";
import type { Database } from "@/types/database";

type AlarmRow = Database["public"]["Tables"]["alarms"]["Row"];
type SiteRow = Pick<Database["public"]["Tables"]["sites"]["Row"], "id" | "name">;
type BaseStationRow = Pick<Database["public"]["Tables"]["base_stations"]["Row"], "id" | "code">;
type ProfileRow = Pick<Database["public"]["Tables"]["profiles"]["Row"], "id" | "full_name" | "email" | "role">;
type AlarmNoteRow = Database["public"]["Tables"]["alarm_notes"]["Row"];
type AlarmEventRow = Database["public"]["Tables"]["alarm_events"]["Row"];

export async function getAlarmDetail(alarmId: string) {
  const supabase = createSupabaseAdminClient();
  const { tenant } = await getTenantContext();

  const [alarmResult, sitesResult, stationsResult, profilesResult, notesResult, eventsResult] =
    await Promise.all([
      supabase.from("alarms").select("*").eq("tenant_id", tenant.id).eq("id", alarmId).maybeSingle(),
      supabase.from("sites").select("id, name").eq("tenant_id", tenant.id),
      supabase.from("base_stations").select("id, code").eq("tenant_id", tenant.id),
      supabase.from("profiles").select("id, full_name, email, role").eq("tenant_id", tenant.id),
      supabase.from("alarm_notes").select("*").eq("tenant_id", tenant.id).eq("alarm_id", alarmId).order("created_at", { ascending: false }),
      supabase.from("alarm_events").select("*").eq("tenant_id", tenant.id).eq("alarm_id", alarmId).order("created_at", { ascending: false })
    ]);

  if (alarmResult.error) throw alarmResult.error;
  if (sitesResult.error) throw sitesResult.error;
  if (stationsResult.error) throw stationsResult.error;
  if (profilesResult.error) throw profilesResult.error;
  if (notesResult.error) throw notesResult.error;
  if (eventsResult.error) throw eventsResult.error;

  if (!alarmResult.data) {
    notFound();
  }

  const sites = (sitesResult.data ?? []) as SiteRow[];
  const stations = (stationsResult.data ?? []) as BaseStationRow[];
  const profiles = (profilesResult.data ?? []) as ProfileRow[];
  const notes = (notesResult.data ?? []) as AlarmNoteRow[];
  const events = (eventsResult.data ?? []) as AlarmEventRow[];
  const alarm = alarmResult.data as AlarmRow;

  return {
    alarm: mapAlarm(alarm, sites, stations, profiles),
    notes: notes.map((note) => mapAlarmNote(note, profiles)),
    events: events.map((event) => mapAlarmEvent(event, profiles)),
    assigneeOptions: profiles.map((profile) => ({
      value: profile.id,
      label: profile.full_name ?? profile.email ?? profile.id
    }))
  };
}
