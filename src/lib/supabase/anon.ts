import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/core/config/env";

/**
 * Client Supabase « anon ».
 * Sert UNIQUEMENT à vérifier un JWT entrant via `auth.getUser(token)`.
 * Aucune session persistée : chaque appel est sans état.
 */
export function createAnonClient() {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}
