import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getTenantContext } from "@/lib/auth/access";
import type { AnalyticsSnapshot } from "@/types/domain";
import type { Database } from "@/types/database";

type SnapshotRow = Database["public"]["Tables"]["network_snapshots"]["Row"];

export async function getAnalyticsSnapshots(): Promise<AnalyticsSnapshot[]> {
  const supabase = createSupabaseAdminClient();
  const { tenant } = await getTenantContext();

  const { data, error } = await supabase
    .from("network_snapshots")
    .select("*")
    .eq("tenant_id", tenant.id)
    .order("snapshot_date", { ascending: true });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as SnapshotRow[];

  return rows.map((snapshot) => ({
    id: snapshot.id,
    label: snapshot.label,
    coverage: snapshot.coverage,
    utilization: snapshot.utilization,
    energyCost: snapshot.energy_cost_cents / 100
  }));
}
