"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getServiceClient } from "@/lib/supabase/service";
import { userRoleRepo } from "@/core/repositories/userRoleRepo";

/** Rôle admin de l'utilisateur connecté (session cookie), pour adapter l'UI côté serveur. */
export async function getCurrentAdminRole(): Promise<string | null> {
  const sessionClient = await createSupabaseServerClient();
  const { data } = await sessionClient.auth.getUser();
  if (!data.user) return null;
  return userRoleRepo.getRole(getServiceClient(), data.user.id);
}
