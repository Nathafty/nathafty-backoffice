import { z } from "zod";
import { isoDate } from "./common";

export const expenseCategory = z.enum(["carburant", "salaire", "maintenance", "autre"]);

export const createExpenseDto = z.object({
  category: expenseCategory,
  amount_mru: z.number().min(0),
  expense_date: isoDate,
  description: z.string().max(2000).optional(),
  vehicle_id: z.number().int().positive().nullable().optional(),
  driver_id: z.number().int().positive().nullable().optional(),
  payment_method: z.string().max(50).optional(),
});
export type CreateExpenseDto = z.infer<typeof createExpenseDto>;

export const updateExpenseDto = createExpenseDto.partial();
export type UpdateExpenseDto = z.infer<typeof updateExpenseDto>;
