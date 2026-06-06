import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/core/config/env";

/**
 * Client Supabase « service-role » (bypass RLS).
 * À utiliser EXCLUSIVEMENT côté serveur, dans les repositories.
 * La clé service-role ne doit jamais transiter vers le client.
 *
 * Singleton : un seul client réutilisé sur toute la durée de vie du process.
 */
let client: SupabaseClient | null = null;

export function getServiceClient(): SupabaseClient {
  if (!client) {
    client = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      },
    );
  }
  return client;
}
