import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { renewalRepo } from "@/core/repositories/renewalRepo";
import { subscriptionRepo } from "@/core/repositories/subscriptionRepo";
import { subscriptionPlanRepo } from "@/core/repositories/subscriptionPlanRepo";
import { householdRepo } from "@/core/repositories/householdRepo";
import { notificationService } from "@/core/services/notification";
import { errors } from "@/core/http/errors";
import type { CreatePlanDto, UpdatePlanDto } from "@/core/dto/subscriptionAdmin";

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const subscriptionAdminService = {
  /** Approuve un renouvellement : crée l'abonnement, valide le ménage, notifie. */
  async approveRenewal(db: SupabaseClient, renewalId: number) {
    const renewal = await renewalRepo.byId(db, renewalId);
    if (!renewal) throw errors.notFound("Demande introuvable");
    if (renewal.status !== "pending") {
      throw errors.conflict("Demande déjà traitée", "RENEWAL_NOT_PENDING");
    }

    const plan = await subscriptionPlanRepo.byId(db, renewal.requested_plan_id);
    if (!plan) throw errors.badRequest("Plan introuvable", "PLAN_NOT_FOUND");

    const start = new Date().toISOString().slice(0, 10);
    const end = addDays(start, plan.duration_days);

    const subscription = await subscriptionRepo.insertSubscription(db, {
      household_id: renewal.household_id,
      plan_id: plan.id,
      start_date: start,
      end_date: end,
      status: "active",
    });

    await renewalRepo.markProcessed(db, renewalId, "processed");
    await householdRepo.setValidation(db, renewal.household_id, {
      status: "VALID",
      actif_remaining_days: plan.duration_days,
    });

    const userId = await householdRepo.getUserId(db, renewal.household_id);
    if (userId) {
      await notificationService.notify(db, {
        user_id: userId,
        type: "renewal_approved",
        title: "Renouvellement approuvé",
        body: `Votre abonnement est actif jusqu'au ${end}.`,
        data: { plan_id: plan.id, end_date: end },
      });
    }
    return subscription;
  },

  async rejectRenewal(db: SupabaseClient, renewalId: number, adminNote?: string) {
    const renewal = await renewalRepo.byId(db, renewalId);
    if (!renewal) throw errors.notFound("Demande introuvable");
    if (renewal.status !== "pending") {
      throw errors.conflict("Demande déjà traitée", "RENEWAL_NOT_PENDING");
    }
    await renewalRepo.markProcessed(db, renewalId, "rejected", adminNote);
    return { id: renewalId, status: "rejected" };
  },

  validateHousehold(db: SupabaseClient, householdId: string) {
    return householdRepo.setValidation(db, householdId, { status: "VALID" });
  },

  createPlan(db: SupabaseClient, dto: CreatePlanDto) {
    return subscriptionPlanRepo.insert(db, dto);
  },

  updatePlan(db: SupabaseClient, id: number, dto: UpdatePlanDto) {
    return subscriptionPlanRepo.updateById(db, id, dto);
  },
};
