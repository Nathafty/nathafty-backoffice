import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface UserRoleRow {
  user_id: string;
  role: string;
  created_at: string | null;
}

/** Seul point d'accès Supabase pour la table user_roles (PK = user_id). */
export const userRoleRepo = {
  async setRole(db: SupabaseClient, userId: string, role: string): Promise<void> {
    const { error } = await db
      .from("user_roles")
      .upsert({ user_id: userId, role }, { onConflict: "user_id" });
    if (error) throw error;
  },

  async getRole(db: SupabaseClient, userId: string): Promise<string | null> {
    const { data, error } = await db
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return (data?.role as string | undefined) ?? null;
  },

  async listByRoles(db: SupabaseClient, roles: string[]): Promise<UserRoleRow[]> {
    const { data, error } = await db
      .from("user_roles")
      .select("user_id, role, created_at")
      .in("role", roles)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as UserRoleRow[];
  },
};
