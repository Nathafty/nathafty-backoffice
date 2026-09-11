import { z } from "zod";

export const createVehicleDto = z.object({
  license_plate: z.string().min(1).max(50),
  type: z.string().max(50).optional(),
  assigned_driver_id: z.number().int().positive().nullable().optional(),
});
export type CreateVehicleDto = z.infer<typeof createVehicleDto>;

export const updateVehicleDto = createVehicleDto.partial().extend({
  is_active: z.boolean().optional(),
});
export type UpdateVehicleDto = z.infer<typeof updateVehicleDto>;
