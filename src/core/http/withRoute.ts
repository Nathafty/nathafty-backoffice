import "server-only";
import type { NextRequest } from "next/server";
import { type AppContext, buildContext } from "./context";
import { toErrorResponse } from "./responses";

/** Arguments reçus par un handler métier enveloppé par withRoute. */
export interface RouteArgs<P> {
  req: NextRequest;
  ctx: AppContext;
  /** Paramètres dynamiques de route (ex. { id: "42" }), déjà résolus. */
  params: P;
}

export type RouteHandler<P> = (args: RouteArgs<P>) => Promise<Response> | Response;

/** Forme du second argument d'un Route Handler Next.js (params asynchrones). */
interface NextRouteContext<P> {
  params: Promise<P>;
}

/**
 * Adaptateur fin pour les Route Handlers :
 * 1. construit le contexte (auth + rôle + client service-role)
 * 2. résout les params dynamiques
 * 3. exécute le handler métier
 * 4. mappe toute erreur (AppError / ZodError / autre) en Response
 *
 * Un route.ts se réduit à : export const GET = withRoute(handler).
 */
export function withRoute<P = Record<string, never>>(handler: RouteHandler<P>) {
  return async (
    req: NextRequest,
    routeCtx?: NextRouteContext<P>,
  ): Promise<Response> => {
    try {
      const ctx = await buildContext(req);
      const params = routeCtx?.params
        ? await routeCtx.params
        : ({} as P);
      return await handler({ req, ctx, params });
    } catch (err) {
      return toErrorResponse(err);
    }
  };
}
