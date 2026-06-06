import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { houseToCollectRepo } from "@/core/repositories/houseToCollectRepo";
import type { DateRange } from "@/core/dto/common";

export const collectionService = {
  getCalendar(db: SupabaseClient, householdId: string, range: DateRange) {
    return houseToCollectRepo.calendarForHousehold(
      db,
      householdId,
      range.from,
      range.to,
    );
  },
};
