import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { collectionRepo } from "@/core/repositories/collectionRepo";
import { houseToCollectRepo } from "@/core/repositories/houseToCollectRepo";
import { notificationService } from "@/core/services/notification";
import { errors } from "@/core/http/errors";
import type { CompleteHouseDto, OptimizeQuery, SkipHouseDto } from "@/core/dto/driver";

/** Date du jour au format AAAA-MM-JJ (Mauritanie = UTC). */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Distance Haversine en mètres entre deux points GPS. */
function haversine(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

interface Point {
  house: unknown;
  lat: number | null;
  lng: number | null;
}

export const driverService = {
  /** Tournée du jour : collectes du collecteur planifiées aujourd'hui + compteurs. */
  async getTodayTour(db: SupabaseClient, driverId: number) {
    const collections = await collectionRepo.byDriverOnDate(db, driverId, today());
    return collections.map((c) => {
      const houses = ((c as { houses_to_collect?: { status: string | null }[] })
        .houses_to_collect ?? []);
      const done = houses.filter((h) => h.status === "done").length;
      const skipped = houses.filter((h) => h.status === "skipped").length;
      return {
        ...c,
        houses_total: houses.length,
        houses_done: done,
        houses_skipped: skipped,
        houses_pending: houses.length - done - skipped,
      };
    });
  },

  /** Détail d'une tournée (maisons + ménages) — vérifie l'appartenance au collecteur. */
  async getCollectionDetail(db: SupabaseClient, driverId: number, collectionId: number) {
    const collection = await collectionRepo.byIdForDriver(db, collectionId, driverId);
    if (!collection) throw errors.notFound("Tournée introuvable ou non assignée");
    const houses = await houseToCollectRepo.listByCollection(db, collectionId);
    return { collection, houses };
  },

  /**
   * Itinéraire optimisé (Nearest-Neighbor en mémoire) à partir de la position du collecteur.
   * Renvoie l'ordre de visite + distance par étape + distance cumulée. Pas de persistance.
   */
  async optimizeRoute(
    db: SupabaseClient,
    driverId: number,
    collectionId: number,
    pos: OptimizeQuery,
  ) {
    const collection = await collectionRepo.byIdForDriver(db, collectionId, driverId);
    if (!collection) throw errors.notFound("Tournée introuvable ou non assignée");

    const houses = await houseToCollectRepo.listByCollection(db, collectionId);
    const points: Point[] = houses.map((h) => {
      const hh = (h as { households?: { latitude: number | null; longitude: number | null } })
        .households;
      return { house: h, lat: hh?.latitude ?? null, lng: hh?.longitude ?? null };
    });

    const withCoords = points.filter((p) => p.lat !== null && p.lng !== null);
    const withoutCoords = points.filter((p) => p.lat === null || p.lng === null);

    const ordered: { house: unknown; leg_distance_m: number; cumulative_m: number }[] = [];
    let curLat = pos.lat;
    let curLng = pos.lng;
    let cumulative = 0;
    const remaining = [...withCoords];

    while (remaining.length > 0) {
      let bestIdx = 0;
      let bestDist = Infinity;
      for (let i = 0; i < remaining.length; i++) {
        const d = haversine(curLat, curLng, remaining[i].lat!, remaining[i].lng!);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      }
      const [next] = remaining.splice(bestIdx, 1);
      cumulative += bestDist;
      ordered.push({
        house: next.house,
        leg_distance_m: Math.round(bestDist),
        cumulative_m: Math.round(cumulative),
      });
      curLat = next.lat!;
      curLng = next.lng!;
    }

    return {
      collection_id: collectionId,
      start: { lat: pos.lat, lng: pos.lng },
      total_distance_m: Math.round(cumulative),
      ordered_houses: ordered,
      unlocated_houses: withoutCoords.map((p) => p.house),
    };
  },

  /** Valide une collecte : statut 'done' + preuve, puis push 'collection_done' au client. */
  async completeHouse(
    db: SupabaseClient,
    driverId: number,
    houseId: number,
    dto: CompleteHouseDto,
  ) {
    const house = await this.requireOwnedPendingHouse(db, driverId, houseId);

    const updated = await houseToCollectRepo.updateStatus(db, houseId, {
      status: "done",
      completed_at: new Date().toISOString(),
      completed_by_driver_id: driverId,
      proof_photo_url: dto.photo_url,
      proof_latitude: dto.lat,
      proof_longitude: dto.lng,
      driver_note: dto.note ?? null,
    });

    const userId = house.households?.user_id;
    if (userId) {
      await notificationService.notify(db, {
        user_id: userId,
        type: "collection_done",
        title: "Votre poubelle a été collectée",
        body: "La collecte a bien été effectuée. Merci !",
        data: {
          household_id: house.household_id,
          collection_id: house.collection_id,
          photo_url: dto.photo_url,
        },
      });
    }

    return updated;
  },

  /** Marque une maison non collectée : statut 'skipped' + motif. */
  async skipHouse(
    db: SupabaseClient,
    driverId: number,
    houseId: number,
    dto: SkipHouseDto,
  ) {
    await this.requireOwnedPendingHouse(db, driverId, houseId);
    return houseToCollectRepo.updateStatus(db, houseId, {
      status: "skipped",
      skip_reason: dto.reason,
      driver_note: dto.note ?? null,
      completed_by_driver_id: driverId,
    });
  },

  /** Historique des tournées du collecteur sur une période. */
  async getHistory(
    db: SupabaseClient,
    driverId: number,
    range: { from: string; to: string },
  ) {
    return collectionRepo.historyByDriver(db, driverId, range.from, range.to);
  },

  /** Vérifie qu'une maison existe, appartient au collecteur, et est encore 'pending'. */
  async requireOwnedPendingHouse(db: SupabaseClient, driverId: number, houseId: number) {
    const house = await houseToCollectRepo.getById(db, houseId);
    if (!house) throw errors.notFound("Maison introuvable");
    if (house.collections?.driver_id !== driverId) {
      throw errors.forbidden("Cette maison n'appartient pas à votre tournée");
    }
    if (house.status && house.status !== "pending") {
      throw errors.conflict(
        `Maison déjà traitée (statut: ${house.status})`,
        "HOUSE_ALREADY_PROCESSED",
      );
    }
    return house;
  },
};
