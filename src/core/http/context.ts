import "server-only";
import type { NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAnonClient } from "@/lib/supabase/anon";
import { getServiceClient } from "@/lib/supabase/service";
import { errors } from "./errors";

export type UserRole = "customer" | "client" | "driver" | "admin" | "super_admin";

/** Contexte applicatif injecté dans chaque handler par withRoute. */
export interface AppContext {
  /** auth.users.id de l'utilisateur authentifié. */
  userId: string;
  /** Rôle applicatif issu de user_roles (null si aucune ligne). */
  role: UserRole | null;
  /** Client service-role pour les accès données (utilisé par les repos). */
  supabase: SupabaseClient;
}

function extractBearer(req: NextRequest): string {
  const header = req.headers.get("authorization") ?? "";
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    throw errors.unauthorized("Header Authorization: Bearer <jwt> requis");
  }
  return token;
}

/**
 * Vérifie le JWT entrant et construit le contexte applicatif.
 * - Vérifie le token via le client anon (auth.getUser).
 * - Charge le rôle applicatif depuis user_roles avec le client service-role.
 */
export async function buildContext(req: NextRequest): Promise<AppContext> {
  const token = extractBearer(req);

  const anon = createAnonClient();
  const { data, error } = await anon.auth.getUser(token);
  if (error || !data.user) {
    throw errors.unauthorized("Token invalide ou expiré");
  }

  const supabase = getServiceClient();
  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id)
    .maybeSingle();

  return {
    userId: data.user.id,
    role: (roleRow?.role as UserRole | undefined) ?? null,
    supabase,
  };
}
