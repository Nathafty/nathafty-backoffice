import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Seul point d'accès Supabase pour la table user_roles (PK = user_id). */
export const userRoleRepo = {
  async setRole(db: SupabaseClient, userId: string, role: string): Promise<void> {
    const { error } = await db
      .from("user_roles")
      .upsert({ user_id: userId, role }, { onConflict: "user_id" });
    if (error) throw error;
  },
};
