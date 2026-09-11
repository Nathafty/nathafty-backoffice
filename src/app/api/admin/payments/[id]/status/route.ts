import { errors, ok } from "@/core/http";
import { withAdminRoute } from "@/core/http/withAdminRoute";
import { paymentAdminService } from "@/core/services/admin/paymentAdmin";
import { updatePaymentStatusDto } from "@/core/dto/payment";

export const POST = withAdminRoute<{ id: string }>(async ({ req, params, supabase }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) throw errors.badRequest("Identifiant invalide");
  const dto = updatePaymentStatusDto.parse(await req.json());
  return ok(await paymentAdminService.setStatus(supabase, id, dto.status));
});
