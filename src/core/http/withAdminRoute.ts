import "server-only";
import type { NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getServiceClient } from "@/lib/supabase/service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { errors } from "./errors";
import { toErrorResponse } from "./responses";
import type { UserRole } from "./context";

/**
 * Arguments d'un handler admin. `supabase` reste le client service-role (comme avant) —
 * aucun handler existant n'a besoin de changer. `userId`/`role` sont désormais disponibles
 * pour les handlers qui en ont besoin.
 */
export interface AdminRouteArgs<P> {
  req: NextRequest;
  params: P;
  supabase: SupabaseClient;
  userId: string;
  role: UserRole;
}

export type AdminRouteHandler<P> = (
  args: AdminRouteArgs<P>,
) => Promise<Response> | Response;

interface NextRouteContext<P> {
  params: Promise<P>;
}

const ADMIN_ROLES: UserRole[] = ["admin", "super_admin"];

/**
 * Vraie barrière de sécurité pour les routes `/api/admin/*` : vérifie la session cookie
 * (posée par la connexion admin, `@supabase/ssr`) puis le rôle dans `user_roles`. Rejette
 * même une requête qui contournerait entièrement l'UI/le middleware de page.
 */
export function withAdminRoute<P = Record<string, never>>(
  handler: AdminRouteHandler<P>,
) {
  return async (
    req: NextRequest,
    routeCtx?: NextRouteContext<P>,
  ): Promise<Response> => {
    try {
      const sessionClient = await createSupabaseServerClient();
      const { data: userData, error: userError } = await sessionClient.auth.getUser();
      if (userError || !userData.user) {
        throw errors.unauthorized("Session admin requise");
      }

      const supabase = getServiceClient();
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id)
        .maybeSingle();
      const role = (roleRow?.role as UserRole | undefined) ?? null;
      if (!role || !ADMIN_ROLES.includes(role)) {
        throw errors.forbidden("Rôle admin requis");
      }

      const params = routeCtx?.params ? await routeCtx.params : ({} as P);
      return await handler({ req, params, supabase, userId: userData.user.id, role });
    } catch (err) {
      return toErrorResponse(err);
    }
  };
}
