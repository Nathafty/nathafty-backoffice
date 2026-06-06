import { ok, withRoute } from "@/core/http";
import { getDriverForUser } from "@/core/services/identity";
import { driverService } from "@/core/services/driver";
import { dateRangeQuery, parseQuery } from "@/core/dto/common";

export const GET = withRoute(async ({ ctx, req }) => {
  const { id } = await getDriverForUser(ctx);
  const range = parseQuery(req.url, dateRangeQuery);
  return ok(await driverService.getHistory(ctx.supabase, id, range));
});
