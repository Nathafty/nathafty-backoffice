import "server-only";
import type { NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getServiceClient } from "@/lib/supabase/service";
import { toErrorResponse } from "./responses";

/**
 * Arguments d'un handler admin. Le client service-role est injecté pour commodité.
 *
 * ⚠️ Auth admin DIFFÉRÉE : ce wrapper n'exige pas encore de session/rôle. C'est le
 * **point d'ancrage unique** pour brancher plus tard la garde `admin`/`super_admin`
 * (vérif session @supabase/ssr + user_roles) sans toucher aux routes.
 */
export interface AdminRouteArgs<P> {
  req: NextRequest;
  params: P;
  supabase: SupabaseClient;
}

export type AdminRouteHandler<P> = (
  args: AdminRouteArgs<P>,
) => Promise<Response> | Response;

interface NextRouteContext<P> {
  params: Promise<P>;
}

export function withAdminRoute<P = Record<string, never>>(
  handler: AdminRouteHandler<P>,
) {
  return async (
    req: NextRequest,
    routeCtx?: NextRouteContext<P>,
  ): Promise<Response> => {
    try {
      // TODO(auth admin) : exiger ici une session admin/super_admin.
      const params = routeCtx?.params ? await routeCtx.params : ({} as P);
      return await handler({ req, params, supabase: getServiceClient() });
    } catch (err) {
      return toErrorResponse(err);
    }
  };
}
