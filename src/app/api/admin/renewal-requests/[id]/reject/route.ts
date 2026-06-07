import { errors, ok } from "@/core/http";
import { withAdminRoute } from "@/core/http/withAdminRoute";
import { subscriptionAdminService } from "@/core/services/admin/subscriptionAdmin";
import { rejectRenewalDto } from "@/core/dto/subscriptionAdmin";

export const POST = withAdminRoute<{ id: string }>(async ({ req, params, supabase }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) throw errors.badRequest("Identifiant invalide");
  const body = await req.json().catch(() => ({}));
  const { admin_note } = rejectRenewalDto.parse(body ?? {});
  return ok(await subscriptionAdminService.rejectRenewal(supabase, id, admin_note));
});
