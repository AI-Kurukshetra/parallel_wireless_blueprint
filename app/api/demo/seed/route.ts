import { NextResponse } from "next/server";

import { getTenantContext } from "@/lib/auth/access";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = createSupabaseAdminClient();
  const { tenant, source } = await getTenantContext({ allowFallback: true });

  const [sitesResult, baseStationsResult, alarmsResult, invoicesResult, analyticsResult] = await Promise.all([
    supabase.from("sites").select("*", { count: "exact", head: true }).eq("tenant_id", tenant.id),
    supabase.from("base_stations").select("*", { count: "exact", head: true }).eq("tenant_id", tenant.id),
    supabase.from("alarms").select("*", { count: "exact", head: true }).eq("tenant_id", tenant.id),
    supabase.from("invoices").select("*", { count: "exact", head: true }).eq("tenant_id", tenant.id),
    supabase.from("network_snapshots").select("*", { count: "exact", head: true }).eq("tenant_id", tenant.id)
  ]);

  if (sitesResult.error) throw sitesResult.error;
  if (baseStationsResult.error) throw baseStationsResult.error;
  if (alarmsResult.error) throw alarmsResult.error;
  if (invoicesResult.error) throw invoicesResult.error;
  if (analyticsResult.error) throw analyticsResult.error;

  return NextResponse.json({
    status: "ready",
    generatedAt: new Date().toISOString(),
    tenant: tenant.slug,
    source,
    totals: {
      metrics: 4,
      sites: sitesResult.count ?? 0,
      baseStations: baseStationsResult.count ?? 0,
      alarms: alarmsResult.count ?? 0,
      invoices: invoicesResult.count ?? 0,
      analyticsSnapshots: analyticsResult.count ?? 0
    }
  });
}
