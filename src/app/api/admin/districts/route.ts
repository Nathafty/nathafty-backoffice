import { ok } from "@/core/http";
import { withAdminRoute } from "@/core/http/withAdminRoute";
import { districtAdminService } from "@/core/services/admin/districtAdmin";
import { createDistrictDto } from "@/core/dto/district";

export const POST = withAdminRoute(async ({ req, supabase }) => {
  const dto = createDistrictDto.parse(await req.json());
  return ok(await districtAdminService.create(supabase, dto), 201);
});
