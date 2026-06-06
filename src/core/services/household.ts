import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { householdRepo } from "@/core/repositories/householdRepo";
import type { UpdateHouseholdDto } from "@/core/dto/household";

export const householdService = {
  getProfile(db: SupabaseClient, householdId: string) {
    return householdRepo.getById(db, householdId);
  },

  updateProfile(db: SupabaseClient, householdId: string, dto: UpdateHouseholdDto) {
    return householdRepo.update(db, householdId, dto);
  },
};
