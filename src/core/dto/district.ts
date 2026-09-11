import { z } from "zod";

export const createDistrictDto = z.object({
  name: z.string().min(1).max(200),
  code: z.string().max(50).optional(),
  description: z.string().max(2000).optional(),
});
export type CreateDistrictDto = z.infer<typeof createDistrictDto>;

export const updateDistrictDto = createDistrictDto.partial().extend({
  is_active: z.boolean().optional(),
});
export type UpdateDistrictDto = z.infer<typeof updateDistrictDto>;
