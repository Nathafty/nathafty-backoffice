import { ok, withRoute } from "@/core/http";
import { getHouseholdForUser } from "@/core/services/identity";
import { collectionService } from "@/core/services/collection";
import { dateRangeQuery, parseQuery } from "@/core/dto/common";

export const GET = withRoute(async ({ ctx, req }) => {
  const { id } = await getHouseholdForUser(ctx);
  const range = parseQuery(req.url, dateRangeQuery);
  return ok(await collectionService.getCalendar(ctx.supabase, id, range));
});
