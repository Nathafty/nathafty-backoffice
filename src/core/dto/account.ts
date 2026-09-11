import { z } from "zod";

export const createAdminAccountDto = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["admin", "super_admin"]),
});
export type CreateAdminAccountDto = z.infer<typeof createAdminAccountDto>;
