"use server";

import { getServiceClient } from "@/lib/supabase/service";
import { paymentAdminService } from "@/core/services/admin/paymentAdmin";
import { paymentRepo, type PaymentFilters } from "@/core/repositories/paymentRepo";

export interface PaymentItem {
  id: number;
  household_id: string | null;
  household_name: string | null;
  household_phone: string | null;
  amount: number;
  due_date: string;
  paid_date: string | null;
  status: string | null;
  payment_method: string | null;
  subscription_type: string | null;
}

function toItem(row: unknown): PaymentItem {
  const r = row as {
    id: number;
    household_id: string | null;
    amount: number;
    due_date: string;
    paid_date: string | null;
    status: string | null;
    payment_method: string | null;
    subscription_type: string | null;
    households: { name: string; phone: string | null } | null;
  };
  return {
    id: r.id,
    household_id: r.household_id,
    household_name: r.households?.name ?? null,
    household_phone: r.households?.phone ?? null,
    amount: Number(r.amount),
    due_date: r.due_date,
    paid_date: r.paid_date,
    status: r.status,
    payment_method: r.payment_method,
    subscription_type: r.subscription_type,
  };
}

export async function listPayments(filters: PaymentFilters = {}): Promise<PaymentItem[]> {
  const rows = await paymentAdminService.list(getServiceClient(), filters);
  return rows.map(toItem);
}

export async function getPaymentDetail(id: number) {
  const db = getServiceClient();
  const payment = await paymentRepo.byId(db, id);
  if (!payment) return null;
  const subscription = await paymentRepo.subscriptionForPayment(db, id);
  return { payment: toItem(payment), subscription };
}
