import "server-only";
import type { NextRequest } from "next/server";
import { toErrorResponse } from "./responses";

/** Arguments d'un handler public (aucune authentification). */
export interface PublicRouteArgs<P> {
  req: NextRequest;
  params: P;
}

export type PublicRouteHandler<P> = (
  args: PublicRouteArgs<P>,
) => Promise<Response> | Response;

interface NextRouteContext<P> {
  params: Promise<P>;
}

/**
 * Variante de `withRoute` pour les endpoints PUBLICS (register, login) :
 * même mapping d'erreurs (AppError / ZodError / autre) mais SANS `buildContext`,
 * donc sans exiger de Bearer. Le handler accède à Supabase via getServiceClient()
 * / createAnonClient() selon le besoin.
 */
export function withPublicRoute<P = Record<string, never>>(
  handler: PublicRouteHandler<P>,
) {
  return async (
    req: NextRequest,
    routeCtx?: NextRouteContext<P>,
  ): Promise<Response> => {
    try {
      const params = routeCtx?.params ? await routeCtx.params : ({} as P);
      return await handler({ req, params });
    } catch (err) {
      return toErrorResponse(err);
    }
  };
}
