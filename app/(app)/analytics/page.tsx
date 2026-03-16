import { AnalyticsPageView } from "@/features/analytics/components/analytics-page-view";

export default async function AnalyticsPage({
  searchParams
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const params = await searchParams;
  const requestedPeriod = Number(params.period ?? "30");
  const period = requestedPeriod === 7 || requestedPeriod === 90 ? requestedPeriod : 30;

  return <AnalyticsPageView period={period} />;
}
