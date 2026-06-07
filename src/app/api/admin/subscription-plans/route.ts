import { ok } from "@/core/http";
import { withAdminRoute } from "@/core/http/withAdminRoute";
import { subscriptionAdminService } from "@/core/services/admin/subscriptionAdmin";
import { createPlanDto } from "@/core/dto/subscriptionAdmin";

export const POST = withAdminRoute(async ({ req, supabase }) => {
  const dto = createPlanDto.parse(await req.json());
  return ok(await subscriptionAdminService.createPlan(supabase, dto), 201);
});
