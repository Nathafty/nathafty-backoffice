import { errors, ok } from "@/core/http";
import { withAdminRoute } from "@/core/http/withAdminRoute";
import { respondComplaintDto } from "@/core/dto/adminComplaint";
import { complaintAdminService } from "@/core/services/admin/complaintAdmin";

export const POST = withAdminRoute<{ id: string }>(async ({ req, params, supabase }) => {
  const id = params.id;
  if (!id) throw errors.badRequest("Identifiant invalide");
  const dto = respondComplaintDto.parse(await req.json());
  return ok(await complaintAdminService.respond(supabase, id, dto));
});
