import { z } from "zod";
import { isoDate } from "./common";

export const createCollectionDto = z.object({
  title: z.string().min(1).max(255),
  zone: z.string().max(255).optional(),
  scheduled_date: isoDate,
  end_date: isoDate.optional(),
  driver_id: z.number().int().positive().optional(),
  household_ids: z.array(z.string().min(1)).default([]),
});
export type CreateCollectionDto = z.infer<typeof createCollectionDto>;

export const updateCollectionDto = z.object({
  title: z.string().min(1).max(255).optional(),
  zone: z.string().max(255).nullable().optional(),
  scheduled_date: isoDate.optional(),
  end_date: isoDate.nullable().optional(),
  driver_id: z.number().int().positive().nullable().optional(),
  household_ids: z.array(z.string().min(1)).optional(),
});
export type UpdateCollectionDto = z.infer<typeof updateCollectionDto>;

export const collectionStatusDto = z.object({
  status: z.enum(["SCHEDULED", "PROGRESS", "COMPLETE"]),
});
