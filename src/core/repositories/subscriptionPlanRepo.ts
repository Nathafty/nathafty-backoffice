import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

const COLUMNS =
  "id, code, name, description, price_mru, duration_days, collections_per_week, is_active";

export interface PlanRow {
  id: number;
  code: string;
  name: string;
  description: string | null;
  price_mru: number;
  duration_days: number;
  collections_per_week: number;
  is_active: boolean;
}

export const subscriptionPlanRepo = {
  async listAll(db: SupabaseClient) {
    const { data, error } = await db
      .from("subscription_plans")
      .select(COLUMNS)
      .order("price_mru", { ascending: true });
    if (error) throw error;
    return (data ?? []) as PlanRow[];
  },

  async byId(db: SupabaseClient, id: number): Promise<PlanRow | null> {
    const { data, error } = await db.from("subscription_plans").select(COLUMNS).eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as PlanRow | null) ?? null;
  },

  async insert(
    db: SupabaseClient,
    input: {
      code: string;
      name: string;
      description?: string | null;
      price_mru: number;
      duration_days: number;
      collections_per_week: number;
      is_active?: boolean;
    },
  ): Promise<PlanRow> {
    const { data, error } = await db.from("subscription_plans").insert(input).select(COLUMNS).single();
    if (error) throw error;
    return data as PlanRow;
  },

  async updateById(
    db: SupabaseClient,
    id: number,
    patch: Partial<{
      name: string;
      description: string | null;
      price_mru: number;
      duration_days: number;
      collections_per_week: number;
      is_active: boolean;
    }>,
  ): Promise<PlanRow> {
    const { data, error } = await db
      .from("subscription_plans")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select(COLUMNS)
      .single();
    if (error) throw error;
    return data as PlanRow;
  },
};
