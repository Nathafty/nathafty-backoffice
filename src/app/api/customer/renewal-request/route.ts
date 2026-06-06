import { ok, withRoute } from "@/core/http";
import { getHouseholdForUser } from "@/core/services/identity";
import { subscriptionService } from "@/core/services/subscription";
import { renewalRequestDto } from "@/core/dto/subscription";

export const POST = withRoute(async ({ ctx, req }) => {
  const { id } = await getHouseholdForUser(ctx);
  const dto = renewalRequestDto.parse(await req.json());
  return ok(await subscriptionService.requestRenewal(ctx.supabase, id, dto), 201);
});
