import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/core/config/env";

/**
 * Client Supabase côté serveur (Server Components, Route Handlers admin).
 * Lit/écrit la session via les cookies de la requête — même pattern que
 * `nathafty-customer-survey/src/lib/supabase/server.ts`.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Appelé depuis un Server Component (lecture seule) : ignorer,
          // le middleware se charge du rafraîchissement des cookies dans ce cas.
        }
      },
    },
  });
}
