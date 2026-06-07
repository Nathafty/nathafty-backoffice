import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { collectionRepo } from "@/core/repositories/collectionRepo";
import { houseToCollectRepo } from "@/core/repositories/houseToCollectRepo";
import { driverRepo } from "@/core/repositories/driverRepo";
import { notificationService } from "@/core/services/notification";
import { errors } from "@/core/http/errors";
import type {
  CreateCollectionDto,
  UpdateCollectionDto,
} from "@/core/dto/adminCollection";

async function pushRouteAssigned(
  db: SupabaseClient,
  driverId: number | null | undefined,
  collectionId: number,
  title: string,
) {
  if (!driverId) return;
  const driver = await driverRepo.byId(db, driverId);
  if (driver?.user_id) {
    await notificationService.notify(db, {
      user_id: driver.user_id,
      type: "route_assigned",
      title: "Nouvelle tournée assignée",
      body: title,
      data: { collection_id: collectionId },
    });
  }
}

export const collectionPlanningService = {
  /** Crée une collecte + génère les maisons-à-collecter + notifie le collecteur. */
  async create(db: SupabaseClient, dto: CreateCollectionDto) {
    const collection = await collectionRepo.insert(db, {
      title: dto.title,
      zone: dto.zone ?? null,
      scheduled_date: dto.scheduled_date,
      end_date: dto.end_date ?? null,
      driver_id: dto.driver_id ?? null,
    });

    const rows = dto.household_ids.map((hid) => ({
      household_id: hid,
      collection_id: collection.id,
      status: "pending",
      collection_date: dto.scheduled_date,
    }));
    const housesCount = await houseToCollectRepo.insertMany(db, rows);

    await pushRouteAssigned(db, dto.driver_id, collection.id, dto.title);
    return { collection, housesCount };
  },

  /** Modifie une collecte ; si household_ids fourni, re-génère les maisons. */
  async update(db: SupabaseClient, id: number, dto: UpdateCollectionDto) {
    const existing = await collectionRepo.byId(db, id);
    if (!existing) throw errors.notFound("Collecte introuvable");

    const patch: Record<string, unknown> = {};
    if (dto.title !== undefined) patch.title = dto.title;
    if (dto.zone !== undefined) patch.zone = dto.zone;
    if (dto.scheduled_date !== undefined) patch.scheduled_date = dto.scheduled_date;
    if (dto.end_date !== undefined) patch.end_date = dto.end_date;
    if (dto.driver_id !== undefined) patch.driver_id = dto.driver_id;

    const collection =
      Object.keys(patch).length > 0
        ? await collectionRepo.updateById(db, id, patch)
        : existing;

    if (dto.household_ids) {
      await houseToCollectRepo.deleteByCollection(db, id);
      const date = dto.scheduled_date ?? existing.scheduled_date;
      await houseToCollectRepo.insertMany(
        db,
        dto.household_ids.map((hid) => ({
          household_id: hid,
          collection_id: id,
          status: "pending",
          collection_date: date,
        })),
      );
    }

    // Réassignation → notifier le nouveau collecteur.
    if (dto.driver_id !== undefined && dto.driver_id !== existing.driver_id) {
      await pushRouteAssigned(db, dto.driver_id, id, collection.title);
    }
    return collection;
  },

  async setStatus(db: SupabaseClient, id: number, status: string) {
    const existing = await collectionRepo.byId(db, id);
    if (!existing) throw errors.notFound("Collecte introuvable");
    return collectionRepo.updateById(db, id, { status });
  },
};
