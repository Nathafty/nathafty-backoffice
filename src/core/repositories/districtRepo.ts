import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

const COLUMNS = "id, name, code, description, is_active, created_at, updated_at";

export interface DistrictRow {
  id: number;
  name: string;
  code: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export const districtRepo = {
  async listAll(db: SupabaseClient) {
    const { data, error } = await db.from("districts").select(COLUMNS).order("name", { ascending: true });
    if (error) throw error;
    return (data ?? []) as DistrictRow[];
  },

  /** Liste légère pour les selects (filtre Ménages, formulaire Véhicule). */
  async listLite(db: SupabaseClient) {
    const { data, error } = await db
      .from("districts")
      .select("id, name")
      .order("name", { ascending: true });
    if (error) throw error;
    return (data ?? []) as { id: number; name: string }[];
  },

  async byId(db: SupabaseClient, id: number): Promise<DistrictRow | null> {
    const { data, error } = await db.from("districts").select(COLUMNS).eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as DistrictRow | null) ?? null;
  },

  async insert(
    db: SupabaseClient,
    input: { name: string; code?: string | null; description?: string | null },
  ): Promise<DistrictRow> {
    const { data, error } = await db.from("districts").insert(input).select(COLUMNS).single();
    if (error) throw error;
    return data as DistrictRow;
  },

  async updateById(
    db: SupabaseClient,
    id: number,
    patch: Partial<{ name: string; code: string | null; description: string | null; is_active: boolean }>,
  ): Promise<DistrictRow> {
    const { data, error } = await db
      .from("districts")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select(COLUMNS)
      .single();
    if (error) throw error;
    return data as DistrictRow;
  },
};
