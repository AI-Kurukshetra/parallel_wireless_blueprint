import { AlarmDetailView } from "@/features/alarms/components/alarm-detail-view";
import { getAlarmDetail } from "@/features/alarms/lib/get-alarm-detail";

export default async function AlarmDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ alarmId: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { alarmId } = await params;
  const query = await searchParams;
  const detail = await getAlarmDetail(alarmId);

  return (
    <AlarmDetailView
      alarm={detail.alarm}
      notes={detail.notes}
      events={detail.events}
      assigneeOptions={detail.assigneeOptions}
      success={query.success}
      error={query.error}
    />
  );
}
