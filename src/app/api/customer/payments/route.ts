import { ok, withRoute } from "@/core/http";
import { getHouseholdForUser } from "@/core/services/identity";
import { paymentService } from "@/core/services/payment";

export const GET = withRoute(async ({ ctx }) => {
  const { id } = await getHouseholdForUser(ctx);
  return ok(await paymentService.getHistory(ctx.supabase, id));
});
