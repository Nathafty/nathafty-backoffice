import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

const SELECT = "id, license_plate, type, is_active, assigned_driver_id, drivers(name)";

export interface VehicleRow {
  id: number;
  license_plate: string;
  type: string | null;
  is_active: boolean;
  assigned_driver_id: number | null;
}

export const vehicleRepo = {
  async listAll(db: SupabaseClient) {
    const { data, error } = await db.from("vehicles").select(SELECT).order("id", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  /** Liste légère pour les selects (formulaire Dépenses). */
  async listLite(db: SupabaseClient) {
    const { data, error } = await db
      .from("vehicles")
      .select("id, license_plate, type")
      .order("id", { ascending: true });
    if (error) throw error;
    return (data ?? []) as { id: number; license_plate: string; type: string | null }[];
  },

  async byId(db: SupabaseClient, id: number) {
    const { data, error } = await db.from("vehicles").select(SELECT).eq("id", id).maybeSingle();
    if (error) throw error;
    return data;
  },

  async insert(
    db: SupabaseClient,
    input: { license_plate: string; type?: string | null; assigned_driver_id?: number | null },
  ) {
    const { data, error } = await db.from("vehicles").insert(input).select(SELECT).single();
    if (error) throw error;
    return data;
  },

  async updateById(
    db: SupabaseClient,
    id: number,
    patch: Partial<{
      license_plate: string;
      type: string | null;
      assigned_driver_id: number | null;
      is_active: boolean;
    }>,
  ) {
    const { data, error } = await db.from("vehicles").update(patch).eq("id", id).select(SELECT).single();
    if (error) throw error;
    return data;
  },
};
