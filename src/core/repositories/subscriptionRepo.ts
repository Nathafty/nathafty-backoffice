import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

const SUB_SELECT =
  "id, household_id, plan_id, start_date, end_date, status, payment_id, created_at, " +
  "subscription_plans(id, code, name, description, price_mru, duration_days, collections_per_week)";

export const subscriptionRepo = {
  /** Tous les abonnements d'un ménage (plan inclus), du plus récent au plus ancien. */
  async listByHousehold(db: SupabaseClient, householdId: string) {
    const { data, error } = await db
      .from("subscriptions")
      .select(SUB_SELECT)
      .eq("household_id", householdId)
      .order("start_date", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async planById(db: SupabaseClient, planId: number) {
    const { data, error } = await db
      .from("subscription_plans")
      .select("id, is_active")
      .eq("id", planId)
      .maybeSingle();
    if (error) throw error;
    return data as { id: number; is_active: boolean } | null;
  },

  async hasPendingRenewal(db: SupabaseClient, householdId: string): Promise<boolean> {
    const { count, error } = await db
      .from("renewal_requests")
      .select("id", { count: "exact", head: true })
      .eq("household_id", householdId)
      .eq("status", "pending");
    if (error) throw error;
    return (count ?? 0) > 0;
  },

  async insertRenewal(db: SupabaseClient, householdId: string, planId: number) {
    const { data, error } = await db
      .from("renewal_requests")
      .insert({ household_id: householdId, requested_plan_id: planId })
      .select("id, household_id, requested_plan_id, status, requested_at")
      .single();
    if (error) throw error;
    return data;
  },
};
