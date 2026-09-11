import { errors, ok } from "@/core/http";
import { withAdminRoute } from "@/core/http/withAdminRoute";
import { vehicleAdminService } from "@/core/services/admin/vehicleAdmin";
import { updateVehicleDto } from "@/core/dto/vehicle";

export const POST = withAdminRoute<{ id: string }>(async ({ req, params, supabase }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) throw errors.badRequest("Identifiant invalide");
  const dto = updateVehicleDto.parse(await req.json());
  return ok(await vehicleAdminService.update(supabase, id, dto));
});
