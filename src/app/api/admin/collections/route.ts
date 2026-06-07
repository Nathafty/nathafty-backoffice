import { ok } from "@/core/http";
import { withAdminRoute } from "@/core/http/withAdminRoute";
import { collectionPlanningService } from "@/core/services/admin/collectionPlanning";
import { createCollectionDto } from "@/core/dto/adminCollection";

export const POST = withAdminRoute(async ({ req, supabase }) => {
  const dto = createCollectionDto.parse(await req.json());
  return ok(await collectionPlanningService.create(supabase, dto), 201);
});
