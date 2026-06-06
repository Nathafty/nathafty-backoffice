import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

const PROFILE_COLUMNS =
  "id, name, phone, address, address_details, whatsapp, latitude, longitude, " +
  "district_id, family_size, subscription_type, status, actif_remaining_days, registration_date";

export interface HouseholdUpdate {
  name?: string;
  address?: string;
  address_details?: string;
  whatsapp?: string;
  latitude?: number;
  longitude?: number;
}

export const householdRepo = {
  async getById(db: SupabaseClient, id: string) {
    const { data, error } = await db
      .from("households")
      .select(PROFILE_COLUMNS)
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async update(db: SupabaseClient, id: string, patch: HouseholdUpdate) {
    const { data, error } = await db
      .from("households")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select(PROFILE_COLUMNS)
      .single();
    if (error) throw error;
    return data;
  },
};
