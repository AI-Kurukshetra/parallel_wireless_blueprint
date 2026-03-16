import type { Alarm, AlarmEvent, AlarmNote } from "@/types/domain";
import type { Database } from "@/types/database";

type AlarmRow = Database["public"]["Tables"]["alarms"]["Row"];
type SiteRow = Pick<Database["public"]["Tables"]["sites"]["Row"], "id" | "name">;
type BaseStationRow = Pick<Database["public"]["Tables"]["base_stations"]["Row"], "id" | "code">;
type ProfileRow = Pick<Database["public"]["Tables"]["profiles"]["Row"], "id" | "full_name" | "email">;
type AlarmNoteRow = Database["public"]["Tables"]["alarm_notes"]["Row"];
type AlarmEventRow = Database["public"]["Tables"]["alarm_events"]["Row"];

export function profileName(profile: ProfileRow | undefined) {
  return profile?.full_name ?? profile?.email ?? null;
}

export function mapAlarm(
  alarm: AlarmRow,
  sites: SiteRow[],
  stations: BaseStationRow[],
  profiles: ProfileRow[]
): Alarm {
  return {
    id: alarm.id,
    title: alarm.title,
    siteId: alarm.site_id,
    siteName: sites.find((site) => site.id === alarm.site_id)?.name ?? "Unknown site",
    baseStationId: alarm.base_station_id,
    baseStationCode: stations.find((station) => station.id === alarm.base_station_id)?.code ?? null,
    severity: alarm.severity,
    status: alarm.status,
    category: alarm.category,
    sourceVendor: alarm.source_vendor,
    description: alarm.description,
    message: alarm.message,
    createdAt: alarm.created_at,
    acknowledged: alarm.acknowledged,
    acknowledgedAt: alarm.acknowledged_at,
    assigneeProfileId: alarm.assignee_profile_id,
    assigneeName: profileName(profiles.find((profile) => profile.id === alarm.assignee_profile_id)),
    assignedAt: alarm.assigned_at
  };
}

export function mapAlarmNote(note: AlarmNoteRow, profiles: ProfileRow[]): AlarmNote {
  return {
    id: note.id,
    body: note.body,
    createdAt: note.created_at,
    authorName: profileName(profiles.find((profile) => profile.id === note.author_profile_id))
  };
}

export function mapAlarmEvent(event: AlarmEventRow, profiles: ProfileRow[]): AlarmEvent {
  return {
    id: event.id,
    eventType: event.event_type,
    message: event.message,
    createdAt: event.created_at,
    actorName: profileName(profiles.find((profile) => profile.id === event.actor_profile_id))
  };
}
