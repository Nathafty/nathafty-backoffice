"use server";

import { getServiceClient } from "@/lib/supabase/service";
import { collectionRepo } from "@/core/repositories/collectionRepo";
import { houseToCollectRepo } from "@/core/repositories/houseToCollectRepo";
import { driverRepo } from "@/core/repositories/driverRepo";
import { householdRepo } from "@/core/repositories/householdRepo";

export interface CollectionListItem {
  id: number;
  title: string;
  zone: string | null;
  scheduled_date: string | null;
  status: string | null;
  driver_name: string | null;
  houses_total: number;
  houses_done: number;
}

export async function listCollections(
  filters: { from?: string; to?: string; status?: string } = {},
): Promise<CollectionListItem[]> {
  const rows = await collectionRepo.listAll(getServiceClient(), filters);
  return rows.map((c) => {
    const r = c as unknown as {
      id: number;
      title: string;
      zone: string | null;
      scheduled_date: string | null;
      status: string | null;
      drivers: { name: string } | null;
      houses_to_collect: { status: string | null }[] | null;
    };
    const houses = r.houses_to_collect ?? [];
    return {
      id: r.id,
      title: r.title,
      zone: r.zone,
      scheduled_date: r.scheduled_date,
      status: r.status,
      driver_name: r.drivers?.name ?? null,
      houses_total: houses.length,
      houses_done: houses.filter((h) => h.status === "done").length,
    };
  });
}

export async function getCollectionDetail(id: number) {
  const db = getServiceClient();
  const collection = await collectionRepo.byId(db, id);
  if (!collection) return null;
  const houses = await houseToCollectRepo.listByCollection(db, id);
  return { collection, houses };
}

/** Options pour le formulaire de planification : collecteurs + ménages éligibles. */
export async function planningOptions(districtId?: number) {
  const db = getServiceClient();
  const [drivers, households] = await Promise.all([
    driverRepo.listLite(db),
    householdRepo.listForPlanning(db, districtId ? { district_id: districtId } : {}),
  ]);
  return { drivers, households };
}
