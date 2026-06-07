import { z } from "zod";

export const createDriverDto = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().max(32).optional(),
  nni: z.string().max(64).optional(),
});
export type CreateDriverDto = z.infer<typeof createDriverDto>;

export const updateDriverDto = z.object({
  name: z.string().min(1).max(255).optional(),
  phone: z.string().max(32).nullable().optional(),
  nni: z.string().max(64).nullable().optional(),
});
export type UpdateDriverDto = z.infer<typeof updateDriverDto>;

export const driverStatusDto = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]),
});
