import { ok, withPublicRoute } from "@/core/http";
import { getServiceClient } from "@/lib/supabase/service";
import { authService } from "@/core/services/auth";
import { registerCustomerDto } from "@/core/dto/auth";

export const POST = withPublicRoute(async ({ req }) => {
  const dto = registerCustomerDto.parse(await req.json());
  return ok(await authService.registerCustomer(getServiceClient(), dto), 201);
});
