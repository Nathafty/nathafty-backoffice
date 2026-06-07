import { errors, ok } from "@/core/http";
import { withAdminRoute } from "@/core/http/withAdminRoute";
import { driverAdminService } from "@/core/services/admin/driverAdmin";
import { driverStatusDto } from "@/core/dto/driverAdmin";

export const POST = withAdminRoute<{ id: string }>(async ({ req, params, supabase }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) throw errors.badRequest("Identifiant invalide");
  const { status } = driverStatusDto.parse(await req.json());
  return ok(await driverAdminService.setStatus(supabase, id, status));
});
