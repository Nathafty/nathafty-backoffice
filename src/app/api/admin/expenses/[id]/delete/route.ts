import { errors, ok } from "@/core/http";
import { withAdminRoute } from "@/core/http/withAdminRoute";
import { expenseService } from "@/core/services/admin/expense";

export const POST = withAdminRoute<{ id: string }>(async ({ params, supabase }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) throw errors.badRequest("Identifiant invalide");
  await expenseService.remove(supabase, id);
  return ok({ deleted: true });
});
