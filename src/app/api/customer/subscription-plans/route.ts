import { ok, withRoute } from "@/core/http";
import { subscriptionService } from "@/core/services/subscription";

export const GET = withRoute(async ({ ctx }) => {
  return ok(await subscriptionService.listActivePlans(ctx.supabase));
});
