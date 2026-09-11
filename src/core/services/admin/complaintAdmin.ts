import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { complaintRepo } from "@/core/repositories/complaintRepo";
import { householdRepo } from "@/core/repositories/householdRepo";
import { notificationService } from "@/core/services/notification";
import { errors } from "@/core/http/errors";
import type { RespondComplaintDto } from "@/core/dto/adminComplaint";

const RESOLVED_STATUSES = new Set(["resolved", "closed"]);

export const complaintAdminService = {
  /** Met à jour statut/priorité/réponse d'une réclamation et notifie le ménage. */
  async respond(db: SupabaseClient, id: string, dto: RespondComplaintDto) {
    const patch: Record<string, unknown> = { ...dto, updated_at: new Date().toISOString() };
    if (dto.status && RESOLVED_STATUSES.has(dto.status)) {
      patch.resolved_date = new Date().toISOString().slice(0, 10);
    }

    const updated = await complaintRepo.updateById(db, id, patch);
    if (!updated) throw errors.notFound("Réclamation introuvable");

    if (dto.response && updated.household_id) {
      const userId = await householdRepo.getUserId(db, updated.household_id);
      if (userId) {
        await notificationService.notify(db, {
          user_id: userId,
          type: "complaint_response",
          title: `Réponse à votre réclamation ${updated.ticket_number}`,
          body: dto.response,
          data: { complaint_id: updated.id },
        });
      }
    }

    return updated;
  },
};
