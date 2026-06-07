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

  // ---- Admin ----

  /** Toutes les collectes (driver + statut des maisons), filtrables par période/statut. */
  async listAll(
    db: SupabaseClient,
    filters: { from?: string; to?: string; status?: string } = {},
  ) {
    let q = db
      .from("collections")
      .select(`${COLLECTION_COLUMNS}, drivers(id, name), houses_to_collect(id, status)`)
      .order("scheduled_date", { ascending: false });
    if (filters.from) q = q.gte("scheduled_date", filters.from);
    if (filters.to) q = q.lte("scheduled_date", filters.to);
    if (filters.status) q = q.eq("status", filters.status);
    const { data, error } = await q;
    if (error) throw error;
    return data ?? [];
  },

  /** Détail d'une collecte (admin, sans filtre driver). */
  async byId(db: SupabaseClient, id: number): Promise<CollectionRow | null> {
    const { data, error } = await db
      .from("collections")
      .select(COLLECTION_COLUMNS)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return (data as CollectionRow | null) ?? null;
  },

  async insert(
    db: SupabaseClient,
    input: {
      title: string;
      zone?: string | null;
      scheduled_date: string;
      end_date?: string | null;
      driver_id?: number | null;
    },
  ): Promise<CollectionRow> {
    const { data, error } = await db
      .from("collections")
      .insert(input)
      .select(COLLECTION_COLUMNS)
      .single();
    if (error) throw error;
    return data as CollectionRow;
  },

  async updateById(
    db: SupabaseClient,
    id: number,
    patch: Partial<{
      title: string;
      zone: string | null;
      scheduled_date: string;
      end_date: string | null;
      driver_id: number | null;
      status: string;
    }>,
  ): Promise<CollectionRow> {
    const { data, error } = await db
      .from("collections")
      .update(patch)
      .eq("id", id)
      .select(COLLECTION_COLUMNS)
      .single();
    if (error) throw error;
    return data as CollectionRow;
  },
};
