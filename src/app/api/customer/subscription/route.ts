import { ok, withRoute } from "@/core/http";
import { getHouseholdForUser } from "@/core/services/identity";
import { subscriptionService } from "@/core/services/subscription";

export const GET = withRoute(async ({ ctx }) => {
  const { id } = await getHouseholdForUser(ctx);
  return ok(await subscriptionService.getCurrentAndHistory(ctx.supabase, id));
});
