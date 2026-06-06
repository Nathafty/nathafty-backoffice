import { ok, withRoute } from "@/core/http";
import { getHouseholdForUser } from "@/core/services/identity";
import { householdService } from "@/core/services/household";
import { updateHouseholdDto } from "@/core/dto/household";

export const GET = withRoute(async ({ ctx }) => {
  const { id } = await getHouseholdForUser(ctx);
  return ok(await householdService.getProfile(ctx.supabase, id));
});

export const POST = withRoute(async ({ ctx, req }) => {
  const { id } = await getHouseholdForUser(ctx);
  const dto = updateHouseholdDto.parse(await req.json());
  return ok(await householdService.updateProfile(ctx.supabase, id, dto));
});
