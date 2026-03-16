import { AlarmsPageView } from "@/features/alarms/components/alarms-page-view";

export default async function AlarmsPage({
  searchParams
}: {
  searchParams: Promise<{
    severity?: string;
    status?: string;
    siteId?: string;
    baseStationId?: string;
    search?: string;
    sort?: string;
    success?: string;
    error?: string;
  }>;
}) {
  const params = await searchParams;

  return (
    <AlarmsPageView
      filters={{
        severity: params.severity as never,
        status: params.status as never,
        siteId: params.siteId,
        baseStationId: params.baseStationId,
        search: params.search,
        sort: params.sort as never
      }}
      success={params.success}
      error={params.error}
    />
  );
}
