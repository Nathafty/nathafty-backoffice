import { ok, withRoute } from "@/core/http";
import { getDriverForUser } from "@/core/services/identity";
import { driverService } from "@/core/services/driver";

export const GET = withRoute(async ({ ctx }) => {
  const { id } = await getDriverForUser(ctx);
  return ok(await driverService.getTodayTour(ctx.supabase, id));
});
