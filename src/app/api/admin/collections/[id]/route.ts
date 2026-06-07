import { errors, ok } from "@/core/http";
import { withAdminRoute } from "@/core/http/withAdminRoute";
import { collectionPlanningService } from "@/core/services/admin/collectionPlanning";
import { updateCollectionDto } from "@/core/dto/adminCollection";

export const POST = withAdminRoute<{ id: string }>(async ({ req, params, supabase }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) throw errors.badRequest("Identifiant invalide");
  const dto = updateCollectionDto.parse(await req.json());
  return ok(await collectionPlanningService.update(supabase, id, dto));
});
