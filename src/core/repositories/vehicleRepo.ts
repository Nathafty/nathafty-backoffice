import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export const vehicleRepo = {
  async listLite(db: SupabaseClient) {
    const { data, error } = await db
      .from("vehicles")
      .select("id, license_plate, type")
      .order("id", { ascending: true });
    if (error) throw error;
    return (data ?? []) as { id: number; license_plate: string; type: string | null }[];
  },
};
