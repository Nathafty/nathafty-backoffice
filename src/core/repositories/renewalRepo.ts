import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

const SELECT =
  "id, household_id, requested_plan_id, status, admin_note, requested_at, processed_at, " +
  "households(id, name, phone), subscription_plans(id, name, price_mru, duration_days)";

export interface RenewalRow {
  id: number;
  household_id: string;
  requested_plan_id: number;
  status: string;
}

export const renewalRepo = {
  async listAll(db: SupabaseClient, status?: string) {
    let q = db.from("renewal_requests").select(SELECT).order("requested_at", { ascending: false });
    if (status) q = q.eq("status", status);
    const { data, error } = await q;
    if (error) throw error;
    return data ?? [];
  },

  async byId(db: SupabaseClient, id: number): Promise<RenewalRow | null> {
    const { data, error } = await db
      .from("renewal_requests")
      .select("id, household_id, requested_plan_id, status")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return (data as RenewalRow | null) ?? null;
  },

  async markProcessed(
    db: SupabaseClient,
    id: number,
    status: "processed" | "rejected",
    adminNote?: string,
  ): Promise<void> {
    const { error } = await db
      .from("renewal_requests")
      .update({
        status,
        admin_note: adminNote ?? null,
        processed_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw error;
  },
};
