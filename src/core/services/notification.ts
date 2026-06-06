import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getFcm } from "@/lib/firebase/admin";
import {
  type DeviceTokenUpsert,
  type NewNotification,
  type NotificationRow,
  notificationRepo,
} from "@/core/repositories/notificationRepo";

/**
 * Service notifications.
 * `notify` persiste la notification PUIS tente l'envoi FCM (best-effort) :
 * un échec d'envoi push ne fait jamais échouer l'opération métier appelante.
 */
export const notificationService = {
  async notify(db: SupabaseClient, payload: NewNotification): Promise<NotificationRow> {
    const row = await notificationRepo.insert(db, payload);

    try {
      const tokens = await notificationRepo.getTokensByUser(db, payload.user_id);
      if (tokens.length > 0) {
        await getFcm().sendEachForMulticast({
          tokens,
          notification: {
            title: payload.title,
            body: payload.body ?? undefined,
          },
          // FCM data n'accepte que des chaînes.
          data: stringifyData({ type: payload.type, ...(payload.data ?? {}) }),
        });
      }
    } catch (err) {
      console.error("[notification] échec envoi FCM (ignoré) :", err);
    }

    return row;
  },

  async list(db: SupabaseClient, userId: string, opts: { unread?: boolean }) {
    return notificationRepo.listByUser(db, userId, opts);
  },

  async markRead(db: SupabaseClient, userId: string, id: number) {
    return notificationRepo.markRead(db, userId, id);
  },

  async registerToken(db: SupabaseClient, t: DeviceTokenUpsert) {
    await notificationRepo.upsertToken(db, t);
  },
};

function stringifyData(obj: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = typeof v === "string" ? v : JSON.stringify(v);
  }
  return out;
}
