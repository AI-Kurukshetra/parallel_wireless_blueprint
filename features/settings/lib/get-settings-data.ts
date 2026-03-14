import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getTenantContext } from "@/lib/auth/access";
import type { Database } from "@/types/database";

type SubscriptionRow = Pick<
  Database["public"]["Tables"]["subscriptions"]["Row"],
  "status" | "seats" | "renews_at" | "plan_id"
>;
type PlanRow = Pick<Database["public"]["Tables"]["subscription_plans"]["Row"], "name" | "support_tier">;

export async function getSettingsData() {
  const supabase = createSupabaseAdminClient();
  const { tenant } = await getTenantContext();

  const subscriptionResult = await supabase
    .from("subscriptions")
    .select("status, seats, renews_at, plan_id")
    .eq("tenant_id", tenant.id)
    .single();

  if (subscriptionResult.error) {
    throw subscriptionResult.error;
  }

  const subscription = subscriptionResult.data as SubscriptionRow;

  const planResult = await supabase
    .from("subscription_plans")
    .select("name, support_tier")
    .eq("id", subscription.plan_id)
    .single();

  if (planResult.error) {
    throw planResult.error;
  }

  const plan = planResult.data as PlanRow;

  return {
    tenantName: tenant.name,
    defaultRegion: tenant.default_region,
    criticalAlarmThreshold: `${tenant.critical_alarm_threshold} active alarms`,
    subscriptionStatus: subscription.status,
    subscriptionSeats: subscription.seats,
    renewsAt: subscription.renews_at,
    planName: plan.name,
    supportTier: plan.support_tier
  };
}
