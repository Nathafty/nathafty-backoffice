"use server";

import { getServiceClient } from "@/lib/supabase/service";
import { driverRepo, type DriverRow } from "@/core/repositories/driverRepo";

export async function listDrivers(): Promise<DriverRow[]> {
  return driverRepo.listAll(getServiceClient());
}

export interface DriverStats {
  collectionsCount: number;
  housesDone: number;
  housesTotal: number;
  successRate: number;
}

export async function getDriverDetail(id: number) {
  const db = getServiceClient();
  const driver = await driverRepo.byId(db, id);
  if (!driver) return null;

  // Collectes du collecteur.
  const { data: cols } = await db.from("collections").select("id").eq("driver_id", id);
  const collectionIds = (cols ?? []).map((c) => (c as { id: number }).id);

  let housesTotal = 0;
  let housesDone = 0;
  if (collectionIds.length > 0) {
    const total = await db
      .from("houses_to_collect")
      .select("*", { count: "exact", head: true })
      .in("collection_id", collectionIds);
    housesTotal = total.count ?? 0;
    const done = await db
      .from("houses_to_collect")
      .select("*", { count: "exact", head: true })
      .in("collection_id", collectionIds)
      .eq("status", "done");
    housesDone = done.count ?? 0;
  }

  const stats: DriverStats = {
    collectionsCount: collectionIds.length,
    housesDone,
    housesTotal,
    successRate: housesTotal > 0 ? Math.round((housesDone / housesTotal) * 100) : 0,
  };
  return { driver, stats };
}
