import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

// Colonnes réelles de la vue (vérifiées via information_schema) — évite qu'un futur
// changement de schéma de la vue ne se propage silencieusement à l'API cliente.
const VIEW_HOUSEHOLD_PAYMENTS_COLUMNS =
  "household_id, household_name, phone, address, household_status, subscription_type, " +
  "district_id, district_name, total_payments, pending_payments, paid_payments, " +
  "total_pending_amount, total_paid_amount, total_amount, payment_history";

const PAYMENT_COLUMNS =
  "id, household_id, amount, due_date, paid_date, status, payment_method, subscription_type, " +
  "created_at, updated_at, households(name, phone)";

export interface PaymentFilters {
  status?: string;
  payment_method?: string;
  household_id?: string;
  date_from?: string;
  date_to?: string;
}

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

  /** Liste admin filtrable (colonnes explicites — pas de select("*")). */
  async listAll(db: SupabaseClient, filters: PaymentFilters = {}) {
    let q = db.from("payments").select(PAYMENT_COLUMNS).order("due_date", { ascending: false });
    if (filters.status) q = q.eq("status", filters.status);
    if (filters.payment_method) q = q.ilike("payment_method", filters.payment_method);
    if (filters.household_id) q = q.eq("household_id", filters.household_id);
    if (filters.date_from) q = q.gte("due_date", filters.date_from);
    if (filters.date_to) q = q.lte("due_date", filters.date_to);
    const { data, error } = await q;
    if (error) throw error;
    return data ?? [];
  },

  async byId(db: SupabaseClient, id: number) {
    const { data, error } = await db.from("payments").select(PAYMENT_COLUMNS).eq("id", id).maybeSingle();
    if (error) throw error;
    return data;
  },

  /** Abonnement associé à un paiement (subscriptions.payment_id), pour l'affichage détail. */
  async subscriptionForPayment(db: SupabaseClient, paymentId: number) {
    const { data, error } = await db
      .from("subscriptions")
      .select("id, household_id, plan_id, start_date, end_date, status, subscription_plans(name, price_mru)")
      .eq("payment_id", paymentId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async updateStatus(db: SupabaseClient, id: number, status: string) {
    const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    if (status === "paid") patch.paid_date = new Date().toISOString().slice(0, 10);
    const { data, error } = await db
      .from("payments")
      .update(patch)
      .eq("id", id)
      .select(PAYMENT_COLUMNS)
      .single();
    if (error) throw error;
    return data;
  },
};
