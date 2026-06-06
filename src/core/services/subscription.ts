import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { subscriptionRepo } from "@/core/repositories/subscriptionRepo";
import { errors } from "@/core/http/errors";
import type { RenewalRequestDto } from "@/core/dto/subscription";

export const subscriptionService = {
  /** Abonnement courant (premier 'active', sinon le plus récent) + historique complet. */
  async getCurrentAndHistory(db: SupabaseClient, householdId: string) {
    const history = await subscriptionRepo.listByHousehold(db, householdId);
    const current =
      history.find((s) => (s as { status?: string }).status === "active") ??
      history[0] ??
      null;
    return { current, history };
  },

  async requestRenewal(
    db: SupabaseClient,
    householdId: string,
    dto: RenewalRequestDto,
  ) {
    const plan = await subscriptionRepo.planById(db, dto.plan_id);
    if (!plan) throw errors.badRequest("Plan introuvable", "PLAN_NOT_FOUND");
    if (!plan.is_active) throw errors.badRequest("Plan inactif", "PLAN_INACTIVE");

    if (await subscriptionRepo.hasPendingRenewal(db, householdId)) {
      throw errors.conflict(
        "Une demande de renouvellement est déjà en attente",
        "RENEWAL_ALREADY_PENDING",
      );
    }

    return subscriptionRepo.insertRenewal(db, householdId, dto.plan_id);
  },
};
