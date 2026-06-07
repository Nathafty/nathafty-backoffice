import { errors, ok } from "@/core/http";
import { withAdminRoute } from "@/core/http/withAdminRoute";
import { subscriptionAdminService } from "@/core/services/admin/subscriptionAdmin";
import { updatePlanDto } from "@/core/dto/subscriptionAdmin";

export const POST = withAdminRoute<{ id: string }>(async ({ req, params, supabase }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) throw errors.badRequest("Identifiant invalide");
  const dto = updatePlanDto.parse(await req.json());
  return ok(await subscriptionAdminService.updatePlan(supabase, id, dto));
});
