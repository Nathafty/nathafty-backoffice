import { z } from "zod";
import { latitude, longitude } from "./common";

/** POST /api/driver/houses/:id/complete */
export const completeHouseDto = z.object({
  photo_url: z.string().url(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  note: z.string().max(2000).optional(),
});
export type CompleteHouseDto = z.infer<typeof completeHouseDto>;

/** POST /api/driver/houses/:id/skip */
export const skipHouseDto = z.object({
  reason: z.enum(["absent", "refus", "acces_bloque", "autre"]),
  note: z.string().max(2000).optional(),
});
export type SkipHouseDto = z.infer<typeof skipHouseDto>;

/** GET /api/driver/route/:collectionId/optimize?lat=&lng= */
export const optimizeQuery = z.object({ lat: latitude, lng: longitude });
export type OptimizeQuery = z.infer<typeof optimizeQuery>;
