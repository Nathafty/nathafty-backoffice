import { z } from "zod";

export const createPlanDto = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  price_mru: z.number().min(0),
  duration_days: z.number().int().positive(),
  collections_per_week: z.number().int().positive(),
  is_active: z.boolean().optional(),
});
export type CreatePlanDto = z.infer<typeof createPlanDto>;

export const updatePlanDto = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).nullable().optional(),
  price_mru: z.number().min(0).optional(),
  duration_days: z.number().int().positive().optional(),
  collections_per_week: z.number().int().positive().optional(),
  is_active: z.boolean().optional(),
});
export type UpdatePlanDto = z.infer<typeof updatePlanDto>;

export const rejectRenewalDto = z.object({
  admin_note: z.string().max(2000).optional(),
});
