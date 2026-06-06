import { z } from "zod";

/** POST /api/customer/household — mise à jour partielle du profil. */
export const updateHouseholdDto = z
  .object({
    name: z.string().min(1).max(255).optional(),
    address: z.string().max(2000).optional(),
    address_details: z.string().max(2000).optional(),
    whatsapp: z.string().max(32).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: "Au moins un champ à mettre à jour",
  });

export type UpdateHouseholdDto = z.infer<typeof updateHouseholdDto>;
