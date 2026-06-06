import { ok, withPublicRoute } from "@/core/http";
import { authService } from "@/core/services/auth";
import { loginCustomerDto } from "@/core/dto/auth";

export const POST = withPublicRoute(async ({ req }) => {
  const dto = loginCustomerDto.parse(await req.json());
  return ok(await authService.loginCustomer(dto));
});
