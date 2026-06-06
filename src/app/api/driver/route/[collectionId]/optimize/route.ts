import { errors, ok, withRoute } from "@/core/http";
import { getDriverForUser } from "@/core/services/identity";
import { driverService } from "@/core/services/driver";
import { optimizeQuery } from "@/core/dto/driver";
import { parseQuery } from "@/core/dto/common";

export const GET = withRoute<{ collectionId: string }>(async ({ ctx, req, params }) => {
  const { id: driverId } = await getDriverForUser(ctx);
  const collectionId = Number(params.collectionId);
  if (!Number.isInteger(collectionId) || collectionId <= 0) {
    throw errors.badRequest("Identifiant de tournée invalide");
  }
  const pos = parseQuery(req.url, optimizeQuery);
  return ok(await driverService.optimizeRoute(ctx.supabase, driverId, collectionId, pos));
});
