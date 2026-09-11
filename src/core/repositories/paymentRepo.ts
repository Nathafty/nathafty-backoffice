import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

// Colonnes réelles de la vue (vérifiées via information_schema) — évite qu'un futur
// changement de schéma de la vue ne se propage silencieusement à l'API cliente.
const VIEW_HOUSEHOLD_PAYMENTS_COLUMNS =
  "household_id, household_name, phone, address, household_status, subscription_type, " +
  "district_id, district_name, total_payments, pending_payments, paid_payments, " +
  "total_pending_amount, total_paid_amount, total_amount, payment_history";

export const paymentRepo = {
  /** Ligne agrégée du ménage dans view_household_payments (totaux + payment_history). */
  async summaryForHousehold(db: SupabaseClient, householdId: string) {
    const { data, error } = await db
      .from("view_household_payments")
      .select(VIEW_HOUSEHOLD_PAYMENTS_COLUMNS)
      .eq("household_id", householdId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
};
