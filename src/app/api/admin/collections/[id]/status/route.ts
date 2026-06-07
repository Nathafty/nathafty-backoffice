import { errors, ok } from "@/core/http";
import { withAdminRoute } from "@/core/http/withAdminRoute";
import { collectionPlanningService } from "@/core/services/admin/collectionPlanning";
import { collectionStatusDto } from "@/core/dto/adminCollection";

export const POST = withAdminRoute<{ id: string }>(async ({ req, params, supabase }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) throw errors.badRequest("Identifiant invalide");
  const { status } = collectionStatusDto.parse(await req.json());
  return ok(await collectionPlanningService.setStatus(supabase, id, status));
});
