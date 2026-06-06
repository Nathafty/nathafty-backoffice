import "server-only";
import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { complaintRepo } from "@/core/repositories/complaintRepo";
import { householdRepo } from "@/core/repositories/householdRepo";
import type { CreateComplaintDto } from "@/core/dto/complaint";

export const complaintService = {
  listForHousehold(db: SupabaseClient, householdId: string) {
    return complaintRepo.listByHousehold(db, householdId);
  },

  async create(db: SupabaseClient, householdId: string, dto: CreateComplaintDto) {
    const household = await householdRepo.getById(db, householdId);
    const year = new Date().getFullYear();
    const seq = (await complaintRepo.countForYear(db, year)) + 1;
    const ticketNumber = `CMP-${year}-${String(seq).padStart(4, "0")}`;

    const complaint = await complaintRepo.insert(db, {
      id: randomUUID(),
      ticket_number: ticketNumber,
      household_id: householdId,
      household_name: (household as { name?: string }).name ?? null,
      category: dto.category,
      description: dto.description,
    });

    if (dto.photo_url) {
      await complaintRepo.insertAttachment(
        db,
        (complaint as { id: string }).id,
        dto.photo_url,
      );
    }

    return complaint;
  },
};
