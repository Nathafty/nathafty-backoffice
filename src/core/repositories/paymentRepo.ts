import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export const paymentRepo = {
  /** Ligne agrégée du ménage dans view_household_payments (totaux + payment_history). */
  async summaryForHousehold(db: SupabaseClient, householdId: string) {
    const { data, error } = await db
      .from("view_household_payments")
      .select("*")
      .eq("household_id", householdId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
};
