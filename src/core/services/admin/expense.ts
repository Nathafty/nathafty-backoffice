import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { expenseRepo } from "@/core/repositories/expenseRepo";
import { errors } from "@/core/http/errors";
import type { CreateExpenseDto, UpdateExpenseDto } from "@/core/dto/expense";

export const expenseService = {
  create(db: SupabaseClient, dto: CreateExpenseDto) {
    return expenseRepo.insert(db, {
      category: dto.category,
      amount_mru: dto.amount_mru,
      expense_date: dto.expense_date,
      description: dto.description ?? null,
      vehicle_id: dto.vehicle_id ?? null,
      driver_id: dto.driver_id ?? null,
      payment_method: dto.payment_method ?? null,
    });
  },

  update(db: SupabaseClient, id: number, dto: UpdateExpenseDto) {
    if (Object.keys(dto).length === 0) throw errors.badRequest("Aucun champ à mettre à jour");
    return expenseRepo.updateById(db, id, dto);
  },

  remove(db: SupabaseClient, id: number) {
    return expenseRepo.deleteById(db, id);
  },
};
