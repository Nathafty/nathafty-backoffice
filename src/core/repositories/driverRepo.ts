import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

const DRIVER_COLUMNS = "id, name, phone, nni, status, user_id";

export interface DriverRow {
  id: number;
  name: string;
  phone: string | null;
  nni: string | null;
  status: string | null;
  user_id: string | null;
}

export const driverRepo = {
  async listAll(db: SupabaseClient, filters: { status?: string } = {}) {
    let q = db.from("drivers").select(DRIVER_COLUMNS).order("id", { ascending: false });
    if (filters.status) q = q.eq("status", filters.status);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as DriverRow[];
  },

  /** Liste légère pour les selects (id, name, status). */
  async listLite(db: SupabaseClient) {
    const { data, error } = await db
      .from("drivers")
      .select("id, name, status")
      .order("name", { ascending: true });
    if (error) throw error;
    return (data ?? []) as { id: number; name: string; status: string | null }[];
  },

  async byId(db: SupabaseClient, id: number): Promise<DriverRow | null> {
    const { data, error } = await db
      .from("drivers")
      .select(DRIVER_COLUMNS)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return (data as DriverRow | null) ?? null;
  },

  async insert(
    db: SupabaseClient,
    input: { name: string; phone?: string | null; nni?: string | null; user_id: string },
  ): Promise<DriverRow> {
    const { data, error } = await db
      .from("drivers")
      .insert(input)
      .select(DRIVER_COLUMNS)
      .single();
    if (error) throw error;
    return data as DriverRow;
  },

  async updateById(
    db: SupabaseClient,
    id: number,
    patch: Partial<{ name: string; phone: string | null; nni: string | null; status: string }>,
  ): Promise<DriverRow> {
    const { data, error } = await db
      .from("drivers")
      .update(patch)
      .eq("id", id)
      .select(DRIVER_COLUMNS)
      .single();
    if (error) throw error;
    return data as DriverRow;
  },
};
