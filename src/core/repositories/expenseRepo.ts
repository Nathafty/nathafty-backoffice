import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

const SELECT =
  "id, category, amount_mru, expense_date, description, vehicle_id, driver_id, payment_method, " +
  "vehicles(license_plate), drivers(name)";

export interface ExpenseFilters {
  category?: string;
  from?: string;
  to?: string;
}

export const expenseRepo = {
  async listAll(db: SupabaseClient, filters: ExpenseFilters = {}) {
    let q = db.from("expenses").select(SELECT).order("expense_date", { ascending: false });
    if (filters.category) q = q.eq("category", filters.category);
    if (filters.from) q = q.gte("expense_date", filters.from);
    if (filters.to) q = q.lte("expense_date", filters.to);
    const { data, error } = await q;
    if (error) throw error;
    return data ?? [];
  },

  async insert(
    db: SupabaseClient,
    input: {
      category: string;
      amount_mru: number;
      expense_date: string;
      description?: string | null;
      vehicle_id?: number | null;
      driver_id?: number | null;
      payment_method?: string | null;
    },
  ) {
    const { data, error } = await db.from("expenses").insert(input).select("id").single();
    if (error) throw error;
    return data;
  },

  async updateById(db: SupabaseClient, id: number, patch: Record<string, unknown>) {
    const { data, error } = await db
      .from("expenses")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id")
      .single();
    if (error) throw error;
    return data;
  },

  async deleteById(db: SupabaseClient, id: number): Promise<void> {
    const { error } = await db.from("expenses").delete().eq("id", id);
    if (error) throw error;
  },
};
