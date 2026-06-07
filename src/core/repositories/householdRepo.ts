import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { generateShortId } from "@/core/lib/id";

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

export interface HouseholdCreate {
  name: string;
  phone: string;
  user_id: string;
  address?: string;
  whatsapp?: string;
  district_id?: number;
  family_size?: number;
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

  /** Ménages éligibles à la planification (VALID), filtrables par district. */
  async listForPlanning(
    db: SupabaseClient,
    filters: { district_id?: number } = {},
  ) {
    let q = db
      .from("households")
      .select("id, name, address, district_id, status")
      .eq("status", "VALID")
      .order("name", { ascending: true });
    if (filters.district_id) q = q.eq("district_id", filters.district_id);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as {
      id: string;
      name: string;
      address: string | null;
      district_id: number | null;
      status: string;
    }[];
  },

  async existsByPhone(db: SupabaseClient, phone: string): Promise<boolean> {
    const { count, error } = await db
      .from("households")
      .select("id", { count: "exact", head: true })
      .eq("phone", phone);
    if (error) throw error;
    return (count ?? 0) > 0;
  },

  /** Crée un ménage (id varchar(10) généré). status='PENDING' par défaut côté BDD. */
  async create(db: SupabaseClient, input: HouseholdCreate) {
    const { data, error } = await db
      .from("households")
      .insert({ id: generateShortId(), ...input })
      .select(PROFILE_COLUMNS)
      .single();
    if (error) throw error;
    return data;
  },

  /** user_id Supabase d'un ménage (pour l'envoi de notifications). */
  async getUserId(db: SupabaseClient, id: string): Promise<string | null> {
    const { data, error } = await db
      .from("households")
      .select("user_id")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return (data?.user_id as string | null) ?? null;
  },

  /** Validation/onboarding admin : statut + jours d'abonnement restants. */
  async setValidation(
    db: SupabaseClient,
    id: string,
    patch: { status: string; actif_remaining_days?: number },
  ) {
    const { data, error } = await db
      .from("households")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select(PROFILE_COLUMNS)
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
