import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface NotificationRow {
  id: number;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string | null;
}

export interface NewNotification {
  user_id: string;
  type: string;
  title: string;
  body?: string | null;
  data?: Record<string, unknown> | null;
}

export interface DeviceTokenUpsert {
  user_id: string;
  token: string;
  platform: string;
  app_flavor?: string | null;
}

/** Seul point d'accès Supabase pour notifications + device_tokens. */
export const notificationRepo = {
  async insert(db: SupabaseClient, n: NewNotification): Promise<NotificationRow> {
    const { data, error } = await db
      .from("notifications")
      .insert(n)
      .select("*")
      .single();
    if (error) throw error;
    return data as NotificationRow;
  },

  async listByUser(
    db: SupabaseClient,
    userId: string,
    opts: { unread?: boolean } = {},
  ): Promise<NotificationRow[]> {
    let query = db
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (opts.unread) query = query.is("read_at", null);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as NotificationRow[];
  },

  /** Marque lue une notif appartenant à l'utilisateur. Renvoie null si absente/non possédée. */
  async markRead(
    db: SupabaseClient,
    userId: string,
    id: number,
  ): Promise<NotificationRow | null> {
    const { data, error } = await db
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    return (data as NotificationRow | null) ?? null;
  },

  async getTokensByUser(db: SupabaseClient, userId: string): Promise<string[]> {
    const { data, error } = await db
      .from("device_tokens")
      .select("token")
      .eq("user_id", userId);
    if (error) throw error;
    return (data ?? []).map((r) => r.token as string);
  },

  async upsertToken(db: SupabaseClient, t: DeviceTokenUpsert): Promise<void> {
    const { error } = await db
      .from("device_tokens")
      .upsert(
        {
          user_id: t.user_id,
          token: t.token,
          platform: t.platform,
          app_flavor: t.app_flavor ?? null,
          last_used_at: new Date().toISOString(),
        },
        { onConflict: "token" },
      );
    if (error) throw error;
  },
};
