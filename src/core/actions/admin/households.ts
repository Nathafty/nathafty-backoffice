"use server";

import { getServiceClient } from "@/lib/supabase/service";
import { householdRepo, type HouseholdListRow } from "@/core/repositories/householdRepo";
import { complaintRepo } from "@/core/repositories/complaintRepo";

export async function listHouseholds(): Promise<HouseholdListRow[]> {
  return householdRepo.listAll(getServiceClient());
}

export async function getHouseholdDetail(id: string) {
  const db = getServiceClient();
  // Les deux requêtes ne dépendent que de `id` (déjà connu) : aucune dépendance réelle entre elles.
  const [household, complaints] = await Promise.all([
    householdRepo.getById(db, id),
    complaintRepo.listByHousehold(db, id),
  ]);
  if (!household) return null;
  return { household, complaints };
}
