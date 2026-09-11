import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { paymentRepo, type PaymentFilters } from "@/core/repositories/paymentRepo";
import { errors } from "@/core/http/errors";

export const paymentAdminService = {
  list(db: SupabaseClient, filters: PaymentFilters) {
    return paymentRepo.listAll(db, filters);
  },

  async getDetail(db: SupabaseClient, id: number) {
    const payment = await paymentRepo.byId(db, id);
    if (!payment) throw errors.notFound("Paiement introuvable");
    const subscription = await paymentRepo.subscriptionForPayment(db, id);
    return { payment, subscription };
  },

  async setStatus(db: SupabaseClient, id: number, status: string) {
    const existing = await paymentRepo.byId(db, id);
    if (!existing) throw errors.notFound("Paiement introuvable");
    return paymentRepo.updateStatus(db, id, status);
  },
};
