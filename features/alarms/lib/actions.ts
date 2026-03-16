"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getTenantContext } from "@/lib/auth/access";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AlarmStatus } from "@/types/domain";
import type { Database } from "@/types/database";

type AlarmRow = Database["public"]["Tables"]["alarms"]["Row"];
type AlarmUpdate = Database["public"]["Tables"]["alarms"]["Update"];
type AlarmEventInsert = Database["public"]["Tables"]["alarm_events"]["Insert"];
type AlarmNoteInsert = Database["public"]["Tables"]["alarm_notes"]["Insert"];
type ProfileLookup = Pick<Database["public"]["Tables"]["profiles"]["Row"], "id" | "full_name" | "email">;

async function getTenantAlarm(alarmId: string, tenantId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("alarms")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("id", alarmId)
    .maybeSingle();

  if (error) throw error;
  return data as AlarmRow | null;
}

async function createAlarmEvent(payload: AlarmEventInsert) {
  const supabase = createSupabaseAdminClient();
  await supabase.from("alarm_events").insert(payload as never);
}

function safeError(message: string) {
  return `/alarms?error=${encodeURIComponent(message)}`;
}

function detailUrl(alarmId: string, params: Record<string, string>) {
  const query = new URLSearchParams(params).toString();
  return `/alarms/${alarmId}${query ? `?${query}` : ""}`;
}

export async function acknowledgeAlarmAction(alarmId: string) {
  try {
    const supabase = createSupabaseAdminClient();
    const { tenant, profile } = await getTenantContext();
    const alarm = await getTenantAlarm(alarmId, tenant.id);

    if (!alarm) {
      redirect(safeError("Alarm not found for this tenant."));
    }

    if (alarm.status === "resolved" || alarm.status === "closed") {
      redirect(detailUrl(alarmId, { error: "Resolved or closed alarms cannot be acknowledged." }));
    }

    if (alarm.acknowledged) {
      redirect(detailUrl(alarmId, { error: "This alarm is already acknowledged." }));
    }

    const update: AlarmUpdate = {
      acknowledged: true,
      acknowledged_at: new Date().toISOString(),
      acknowledged_by_profile_id: profile?.id ?? null,
      status: alarm.status === "open" ? "acknowledged" : alarm.status
    };

    const { error } = await supabase
      .from("alarms")
      .update(update as never)
      .eq("tenant_id", tenant.id)
      .eq("id", alarmId);

    if (error) {
      redirect(detailUrl(alarmId, { error: error.message }));
    }

    await createAlarmEvent({
      tenant_id: tenant.id,
      alarm_id: alarmId,
      actor_profile_id: profile?.id ?? null,
      event_type: "acknowledged",
      message: "Alarm acknowledged."
    });

    revalidatePath("/alarms");
    revalidatePath(`/alarms/${alarmId}`);
    redirect(detailUrl(alarmId, { success: "Alarm acknowledged." }));
  } catch (error) {
    redirect(detailUrl(alarmId, { error: error instanceof Error ? error.message : "Unable to acknowledge alarm." }));
  }
}

export async function updateAlarmStatusAction(alarmId: string, formData: FormData) {
  try {
    const supabase = createSupabaseAdminClient();
    const { tenant, profile } = await getTenantContext();
    const alarm = await getTenantAlarm(alarmId, tenant.id);
    const nextStatus = String(formData.get("status") ?? "") as AlarmStatus;

    if (!alarm) {
      redirect(safeError("Alarm not found for this tenant."));
    }

    const allowedStatuses: AlarmStatus[] = ["open", "acknowledged", "in_progress", "resolved", "closed"];
    if (!allowedStatuses.includes(nextStatus)) {
      redirect(detailUrl(alarmId, { error: "Choose a valid status." }));
    }

    if (alarm.status === "closed" && nextStatus !== "closed") {
      redirect(detailUrl(alarmId, { error: "Closed alarms cannot be reopened in this workflow." }));
    }

    const update: AlarmUpdate = {
      status: nextStatus,
      resolved_at: nextStatus === "resolved" || nextStatus === "closed" ? new Date().toISOString() : null,
      acknowledged: nextStatus === "open" ? false : true
    };

    const { error } = await supabase
      .from("alarms")
      .update(update as never)
      .eq("tenant_id", tenant.id)
      .eq("id", alarmId);

    if (error) {
      redirect(detailUrl(alarmId, { error: error.message }));
    }

    await createAlarmEvent({
      tenant_id: tenant.id,
      alarm_id: alarmId,
      actor_profile_id: profile?.id ?? null,
      event_type: "status_changed",
      message: `Alarm status changed to ${nextStatus.replace("_", " ")}.`
    });

    revalidatePath("/alarms");
    revalidatePath(`/alarms/${alarmId}`);
    redirect(detailUrl(alarmId, { success: "Alarm status updated." }));
  } catch (error) {
    redirect(detailUrl(alarmId, { error: error instanceof Error ? error.message : "Unable to update status." }));
  }
}

export async function assignAlarmAction(alarmId: string, formData: FormData) {
  try {
    const supabase = createSupabaseAdminClient();
    const { tenant, profile } = await getTenantContext();
    const alarm = await getTenantAlarm(alarmId, tenant.id);
    const assigneeProfileId = String(formData.get("assigneeProfileId") ?? "");

    if (!alarm) {
      redirect(safeError("Alarm not found for this tenant."));
    }

    if (alarm.status === "closed") {
      redirect(detailUrl(alarmId, { error: "Closed alarms cannot be reassigned." }));
    }

    const { data: assignee, error: assigneeError } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("tenant_id", tenant.id)
      .eq("id", assigneeProfileId)
      .maybeSingle();

    if (assigneeError) {
      redirect(detailUrl(alarmId, { error: assigneeError.message }));
    }

    if (!assignee) {
      redirect(detailUrl(alarmId, { error: "Choose a valid assignee from the current tenant." }));
    }

    const assigneeProfile = assignee as ProfileLookup;

    const update: AlarmUpdate = {
      assignee_profile_id: assigneeProfile.id,
      assigned_by_profile_id: profile?.id ?? null,
      assigned_at: new Date().toISOString(),
      status: alarm.status === "open" ? "in_progress" : alarm.status
    };

    const { error } = await supabase
      .from("alarms")
      .update(update as never)
      .eq("tenant_id", tenant.id)
      .eq("id", alarmId);

    if (error) {
      redirect(detailUrl(alarmId, { error: error.message }));
    }

    await createAlarmEvent({
      tenant_id: tenant.id,
      alarm_id: alarmId,
      actor_profile_id: profile?.id ?? null,
      event_type: "assigned",
      message: `Alarm assigned to ${assigneeProfile.full_name ?? assigneeProfile.email ?? assigneeProfile.id}.`
    });

    revalidatePath("/alarms");
    revalidatePath(`/alarms/${alarmId}`);
    redirect(detailUrl(alarmId, { success: "Alarm assignment updated." }));
  } catch (error) {
    redirect(detailUrl(alarmId, { error: error instanceof Error ? error.message : "Unable to assign alarm." }));
  }
}

export async function addAlarmNoteAction(alarmId: string, formData: FormData) {
  try {
    const supabase = createSupabaseAdminClient();
    const { tenant, profile } = await getTenantContext();
    const alarm = await getTenantAlarm(alarmId, tenant.id);
    const body = String(formData.get("body") ?? "").trim();

    if (!alarm) {
      redirect(safeError("Alarm not found for this tenant."));
    }

    if (!body) {
      redirect(detailUrl(alarmId, { error: "Note body is required." }));
    }

    const notePayload: AlarmNoteInsert = {
      tenant_id: tenant.id,
      alarm_id: alarmId,
      author_profile_id: profile?.id ?? null,
      body
    };

    const { error } = await supabase.from("alarm_notes").insert(notePayload as never);

    if (error) {
      redirect(detailUrl(alarmId, { error: error.message }));
    }

    await createAlarmEvent({
      tenant_id: tenant.id,
      alarm_id: alarmId,
      actor_profile_id: profile?.id ?? null,
      event_type: "note_added",
      message: "Operational note added."
    });

    revalidatePath(`/alarms/${alarmId}`);
    redirect(detailUrl(alarmId, { success: "Note added." }));
  } catch (error) {
    redirect(detailUrl(alarmId, { error: error instanceof Error ? error.message : "Unable to add note." }));
  }
}
