import { ok } from "@/core/http";
import { withAdminRoute } from "@/core/http/withAdminRoute";
import { vehicleAdminService } from "@/core/services/admin/vehicleAdmin";
import { createVehicleDto } from "@/core/dto/vehicle";

export const POST = withAdminRoute(async ({ req, supabase }) => {
  const dto = createVehicleDto.parse(await req.json());
  return ok(await vehicleAdminService.create(supabase, dto), 201);
});
