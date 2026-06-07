import { errors, ok } from "@/core/http";
import { withAdminRoute } from "@/core/http/withAdminRoute";
import { expenseService } from "@/core/services/admin/expense";
import { updateExpenseDto } from "@/core/dto/expense";

export const POST = withAdminRoute<{ id: string }>(async ({ req, params, supabase }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) throw errors.badRequest("Identifiant invalide");
  const dto = updateExpenseDto.parse(await req.json());
  return ok(await expenseService.update(supabase, id, dto));
});
