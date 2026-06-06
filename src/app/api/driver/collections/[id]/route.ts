import { errors, ok, withRoute } from "@/core/http";
import { getDriverForUser } from "@/core/services/identity";
import { driverService } from "@/core/services/driver";

export const GET = withRoute<{ id: string }>(async ({ ctx, params }) => {
  const { id: driverId } = await getDriverForUser(ctx);
  const collectionId = Number(params.id);
  if (!Number.isInteger(collectionId) || collectionId <= 0) {
    throw errors.badRequest("Identifiant de tournée invalide");
  }
  return ok(await driverService.getCollectionDetail(ctx.supabase, driverId, collectionId));
});
