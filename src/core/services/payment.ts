import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { paymentRepo } from "@/core/repositories/paymentRepo";

export const paymentService = {
  getHistory(db: SupabaseClient, householdId: string) {
    return paymentRepo.summaryForHousehold(db, householdId);
  },
};
