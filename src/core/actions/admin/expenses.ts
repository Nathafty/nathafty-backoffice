"use server";

import { getServiceClient } from "@/lib/supabase/service";
import { expenseRepo, type ExpenseFilters } from "@/core/repositories/expenseRepo";
import { vehicleRepo } from "@/core/repositories/vehicleRepo";
import { driverRepo } from "@/core/repositories/driverRepo";

export interface ExpenseItem {
  id: number;
  category: string;
  amount_mru: number;
  expense_date: string;
  description: string | null;
  vehicle_id: number | null;
  driver_id: number | null;
  vehicle_label: string | null;
  driver_name: string | null;
  payment_method: string | null;
}

export interface ExpensesResult {
  items: ExpenseItem[];
  total: number;
  tableMissing: boolean;
}

export async function listExpenses(filters: ExpenseFilters = {}): Promise<ExpensesResult> {
  try {
    const rows = await expenseRepo.listAll(getServiceClient(), filters);
    const items: ExpenseItem[] = rows.map((r) => {
      const x = r as unknown as {
        id: number;
        category: string;
        amount_mru: number;
        expense_date: string;
        description: string | null;
        vehicle_id: number | null;
        driver_id: number | null;
        payment_method: string | null;
        vehicles: { license_plate: string } | null;
        drivers: { name: string } | null;
      };
      return {
        id: x.id,
        category: x.category,
        amount_mru: Number(x.amount_mru),
        expense_date: x.expense_date,
        description: x.description,
        vehicle_id: x.vehicle_id,
        driver_id: x.driver_id,
        vehicle_label: x.vehicles?.license_plate ?? null,
        driver_name: x.drivers?.name ?? null,
        payment_method: x.payment_method,
      };
    });
    const total = items.reduce((s, e) => s + e.amount_mru, 0);
    return { items, total, tableMissing: false };
  } catch (e) {
    if (/does not exist|relation .* expenses/i.test((e as Error).message)) {
      return { items: [], total: 0, tableMissing: true };
    }
    throw e;
  }
}

export async function expenseOptions() {
  const db = getServiceClient();
  const [vehicles, drivers] = await Promise.all([vehicleRepo.listLite(db), driverRepo.listLite(db)]);
  return { vehicles, drivers };
}
