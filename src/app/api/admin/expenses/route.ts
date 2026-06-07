import { ok } from "@/core/http";
import { withAdminRoute } from "@/core/http/withAdminRoute";
import { expenseService } from "@/core/services/admin/expense";
import { createExpenseDto } from "@/core/dto/expense";

export const POST = withAdminRoute(async ({ req, supabase }) => {
  const dto = createExpenseDto.parse(await req.json());
  return ok(await expenseService.create(supabase, dto), 201);
});
