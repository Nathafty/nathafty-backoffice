import { ok } from "@/core/http";
import { withAdminRoute } from "@/core/http/withAdminRoute";
import { driverAdminService } from "@/core/services/admin/driverAdmin";
import { createDriverDto } from "@/core/dto/driverAdmin";

export const POST = withAdminRoute(async ({ req, supabase }) => {
  const dto = createDriverDto.parse(await req.json());
  return ok(await driverAdminService.createWithAccount(supabase, dto), 201);
});
