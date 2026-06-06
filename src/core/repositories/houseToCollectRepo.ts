import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Colonnes d'une ligne houses_to_collect + sa collecte (et son collecteur). */
const CALENDAR_SELECT =
  "id, status, collection_date, completed_at, proof_photo_url, " +
  "proof_latitude, proof_longitude, driver_note, skip_reason, " +
  "collections!inner(id, title, zone, scheduled_date, end_date, status, " +
  "drivers(id, name, phone))";

/** Détail pour le collecteur : la maison + le ménage. */
const HOUSE_DETAIL_SELECT =
  "id, status, collection_id, collection_date, completed_at, proof_photo_url, " +
  "proof_latitude, proof_longitude, driver_note, skip_reason, " +
  "households(id, name, phone, whatsapp, address, address_details, latitude, longitude)";

export interface HouseRow {
  id: number;
  collection_id: number | null;
  status: string | null;
  household_id: string;
  /** driver_id de la collecte parente (contrôle d'accès collecteur). */
  collections: { driver_id: number | null } | null;
  /** user_id du ménage (destinataire du push FCM). */
  households: { user_id: string | null } | null;
}

export const houseToCollectRepo = {
  /** Calendrier d'un ménage : ses maisons-à-collecter dont la collecte est planifiée dans [from,to]. */
  async calendarForHousehold(
    db: SupabaseClient,
    householdId: string,
    from: string,
    to: string,
  ) {
    const { data, error } = await db
      .from("houses_to_collect")
      .select(CALENDAR_SELECT)
      .eq("household_id", householdId)
      .gte("collections.scheduled_date", from)
      .lte("collections.scheduled_date", to)
      .order("scheduled_date", { referencedTable: "collections", ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  /** Maisons d'une collecte donnée (jointes au ménage), pour le collecteur. */
  async listByCollection(db: SupabaseClient, collectionId: number) {
    const { data, error } = await db
      .from("houses_to_collect")
      .select(HOUSE_DETAIL_SELECT)
      .eq("collection_id", collectionId)
      .order("id", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  /** Récupère une maison-à-collecter par id, avec driver de la collecte et user du ménage. */
  async getById(db: SupabaseClient, id: number): Promise<HouseRow | null> {
    const { data, error } = await db
      .from("houses_to_collect")
      .select(
        "id, collection_id, status, household_id, " +
          "collections(driver_id), households(user_id)",
      )
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return (data as unknown as HouseRow | null) ?? null;
  },

  /** Met à jour le statut + preuve d'une maison (collecte validée/non collectée). */
  async updateStatus(
    db: SupabaseClient,
    id: number,
    patch: Record<string, unknown>,
  ) {
    const { data, error } = await db
      .from("houses_to_collect")
      .update(patch)
      .eq("id", id)
      .select(
        "id, status, collection_id, completed_at, completed_by_driver_id, " +
          "proof_photo_url, proof_latitude, proof_longitude, driver_note, skip_reason",
      )
      .single();
    if (error) throw error;
    return data;
  },
};
