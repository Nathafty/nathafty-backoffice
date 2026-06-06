import { ok, withRoute } from "@/core/http";
import { getHouseholdForUser } from "@/core/services/identity";
import { complaintService } from "@/core/services/complaint";
import { createComplaintDto } from "@/core/dto/complaint";

export const GET = withRoute(async ({ ctx }) => {
  const { id } = await getHouseholdForUser(ctx);
  return ok(await complaintService.listForHousehold(ctx.supabase, id));
});

export const POST = withRoute(async ({ ctx, req }) => {
  const { id } = await getHouseholdForUser(ctx);
  const dto = createComplaintDto.parse(await req.json());
  return ok(await complaintService.create(ctx.supabase, id, dto), 201);
});
