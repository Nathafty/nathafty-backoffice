import { errors, ok, withRoute } from "@/core/http";
import { getDriverForUser } from "@/core/services/identity";
import { driverService } from "@/core/services/driver";
import { completeHouseDto } from "@/core/dto/driver";

export const POST = withRoute<{ id: string }>(async ({ ctx, req, params }) => {
  const { id: driverId } = await getDriverForUser(ctx);
  const houseId = Number(params.id);
  if (!Number.isInteger(houseId) || houseId <= 0) {
    throw errors.badRequest("Identifiant de maison invalide");
  }
  const dto = completeHouseDto.parse(await req.json());
  return ok(await driverService.completeHouse(ctx.supabase, driverId, houseId, dto));
});
