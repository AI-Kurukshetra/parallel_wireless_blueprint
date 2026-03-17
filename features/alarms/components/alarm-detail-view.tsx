import Link from "next/link";

import { addAlarmNoteAction, acknowledgeAlarmAction, assignAlarmAction, updateAlarmStatusAction } from "@/features/alarms/lib/actions";
import type { Alarm, AlarmEvent, AlarmNote } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { PageHeader } from "@/components/ui/page-header";
import { SubmitButton } from "@/components/forms/submit-button";
import { formatDateLabel, formatRelativeTime } from "@/lib/utils/dates";
import { formatEnumLabel } from "@/lib/utils/format";

export function AlarmDetailView({
  alarm,
  notes,
  events,
  assigneeOptions,
  success,
  error
}: {
  alarm: Alarm;
  notes: AlarmNote[];
  events: AlarmEvent[];
  assigneeOptions: { value: string; label: string }[];
  success?: string;
  error?: string;
}) {
  const acknowledge = acknowledgeAlarmAction.bind(null, alarm.id);
  const updateStatus = updateAlarmStatusAction.bind(null, alarm.id);
  const assign = assignAlarmAction.bind(null, alarm.id);
  const addNote = addAlarmNoteAction.bind(null, alarm.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Incident detail"
        title={alarm.title}
        description="Drive acknowledgement, assignment, status transitions, and operator notes from one alarm workspace."
        action={
          <Link
            href="/alarms"
            className="inline-flex items-center rounded-full border border-ink/10 bg-white px-5 py-3 text-sm font-medium text-ink"
          >
            Back to Alarms
          </Link>
        }
      />
      {success ? <Notice tone="success">{success}</Notice> : null}
      {error ? <Notice tone="error">{error}</Notice> : null}
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alarm summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-surface px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Severity</p>
                <div className="mt-3">
                  <Badge
                    tone={
                      alarm.severity === "critical"
                        ? "danger"
                        : alarm.severity === "high"
                          ? "warning"
                          : alarm.severity === "medium"
                            ? "info"
                            : "neutral"
                    }
                  >
                    {alarm.severity}
                  </Badge>
                </div>
              </div>
              <div className="rounded-2xl bg-surface px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Status</p>
                <p className="mt-2 text-lg font-medium">{formatEnumLabel(alarm.status)}</p>
              </div>
              <div className="rounded-2xl bg-surface px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Opened</p>
                <p className="mt-2 text-lg font-medium">{formatDateLabel(alarm.createdAt)}</p>
                <p className="text-sm text-ink/55">{formatRelativeTime(alarm.createdAt)}</p>
              </div>
              <div className="rounded-2xl bg-surface px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Scope</p>
                <p className="mt-2 text-lg font-medium">{alarm.siteName}</p>
                <p className="text-sm text-ink/55">{alarm.baseStationCode ?? "No base station linked"}</p>
              </div>
              <div className="rounded-2xl bg-surface px-4 py-4 md:col-span-2">
                <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Description</p>
                <p className="mt-2 text-sm leading-6 text-ink/70">{alarm.description ?? alarm.message ?? "No description provided."}</p>
              </div>
              <div className="rounded-2xl bg-surface px-4 py-4 md:col-span-2">
                <p className="text-xs uppercase tracking-[0.2em] text-ink/45">Message / Vendor</p>
                <p className="mt-2 text-sm leading-6 text-ink/70">
                  {alarm.message ?? "No telemetry message"} {alarm.sourceVendor ? `• ${alarm.sourceVendor}` : ""}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {events.length === 0 ? (
                <Notice tone="info">No activity has been recorded for this alarm yet.</Notice>
              ) : null}
              {events.map((event) => (
                <div key={event.id} className="rounded-2xl border border-ink/8 bg-surface px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium capitalize">{formatEnumLabel(event.eventType)}</p>
                    <p className="text-sm text-ink/55">{formatRelativeTime(event.createdAt)}</p>
                  </div>
                  <p className="mt-2 text-sm text-ink/70">{event.message}</p>
                  <p className="mt-1 text-xs text-ink/45">{event.actorName ?? "System"}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Operational actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl bg-surface p-4">
                <p className="text-sm font-medium text-ink">Acknowledge alarm</p>
                <p className="mt-1 text-sm text-ink/60">Record ownership of the alarm and who acknowledged it.</p>
                <form action={acknowledge} className="mt-4">
                  <SubmitButton pendingLabel="Acknowledging...">Acknowledge</SubmitButton>
                </form>
              </div>
              <form action={assign} className="rounded-2xl bg-surface p-4">
                <p className="text-sm font-medium text-ink">Assign owner</p>
                <p className="mt-1 text-sm text-ink/60">Assign this alarm to a tenant user.</p>
                <select
                  name="assigneeProfileId"
                  defaultValue={alarm.assigneeProfileId ?? ""}
                  className="mt-4 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none transition focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/20"
                >
                  <option value="">Select assignee</option>
                  {assigneeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="mt-4">
                  <SubmitButton pendingLabel="Assigning...">Save Assignment</SubmitButton>
                </div>
              </form>
              <form action={updateStatus} className="rounded-2xl bg-surface p-4">
                <p className="text-sm font-medium text-ink">Update status</p>
                <select
                  name="status"
                  defaultValue={alarm.status}
                  className="mt-4 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none transition focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/20"
                >
                  <option value="open">Open</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="in_progress">In progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <div className="mt-4">
                  <SubmitButton pendingLabel="Updating...">Save Status</SubmitButton>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form action={addNote} className="space-y-4">
                <textarea
                  name="body"
                  rows={4}
                  placeholder="Add an operational note"
                  className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none transition focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/20"
                />
                <SubmitButton pendingLabel="Saving note...">Add Note</SubmitButton>
              </form>
              {notes.length === 0 ? (
                <Notice tone="info">No notes have been added for this alarm yet.</Notice>
              ) : null}
              {notes.map((note) => (
                <div key={note.id} className="rounded-2xl border border-ink/8 bg-surface px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{note.authorName ?? "Unknown author"}</p>
                    <p className="text-sm text-ink/55">{formatRelativeTime(note.createdAt)}</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-ink/70">{note.body}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
