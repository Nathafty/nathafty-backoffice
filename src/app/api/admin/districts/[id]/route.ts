import { errors, ok } from "@/core/http";
import { withAdminRoute } from "@/core/http/withAdminRoute";
import { districtAdminService } from "@/core/services/admin/districtAdmin";
import { updateDistrictDto } from "@/core/dto/district";

export const POST = withAdminRoute<{ id: string }>(async ({ req, params, supabase }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) throw errors.badRequest("Identifiant invalide");
  const dto = updateDistrictDto.parse(await req.json());
  return ok(await districtAdminService.update(supabase, id, dto));
});
