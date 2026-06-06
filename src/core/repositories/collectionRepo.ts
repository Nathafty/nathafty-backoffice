import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

const COLLECTION_COLUMNS = "id, title, zone, scheduled_date, end_date, status, driver_id";

export interface CollectionRow {
  id: number;
  title: string;
  zone: string | null;
  scheduled_date: string | null;
  end_date: string | null;
  status: string | null;
  driver_id: number | null;
}

export const collectionRepo = {
  /** Collectes d'un collecteur planifiées à une date donnée, avec statut des maisons. */
  async byDriverOnDate(db: SupabaseClient, driverId: number, date: string) {
    const { data, error } = await db
      .from("collections")
      .select(`${COLLECTION_COLUMNS}, houses_to_collect(id, status)`)
      .eq("driver_id", driverId)
      .eq("scheduled_date", date)
      .order("id", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  /** Une collecte si elle appartient au collecteur, sinon null. */
  async byIdForDriver(
    db: SupabaseClient,
    collectionId: number,
    driverId: number,
  ): Promise<CollectionRow | null> {
    const { data, error } = await db
      .from("collections")
      .select(COLLECTION_COLUMNS)
      .eq("id", collectionId)
      .eq("driver_id", driverId)
      .maybeSingle();
    if (error) throw error;
    return (data as CollectionRow | null) ?? null;
  },

  /** Historique des collectes d'un collecteur sur une période, avec statut des maisons. */
  async historyByDriver(
    db: SupabaseClient,
    driverId: number,
    from: string,
    to: string,
  ) {
    const { data, error } = await db
      .from("collections")
      .select(`${COLLECTION_COLUMNS}, houses_to_collect(id, status)`)
      .eq("driver_id", driverId)
      .gte("scheduled_date", from)
      .lte("scheduled_date", to)
      .order("scheduled_date", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
};
