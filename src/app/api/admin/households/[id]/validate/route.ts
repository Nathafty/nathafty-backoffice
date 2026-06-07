import { errors, ok } from "@/core/http";
import { withAdminRoute } from "@/core/http/withAdminRoute";
import { subscriptionAdminService } from "@/core/services/admin/subscriptionAdmin";

export const POST = withAdminRoute<{ id: string }>(async ({ params, supabase }) => {
  const id = params.id;
  if (!id) throw errors.badRequest("Identifiant invalide");
  return ok(await subscriptionAdminService.validateHousehold(supabase, id));
});
