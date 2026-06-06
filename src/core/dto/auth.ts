import { z } from "zod";
import { errors } from "@/core/http/errors";

const EMAIL_DOMAIN = "nathafty.mr";

/**
 * Normalise un numéro mauritanien en 8 chiffres locaux.
 * Retire espaces / tirets et le préfixe pays (+222, 222, 00222).
 * Lève badRequest si le résultat n'est pas exactement 8 chiffres.
 */
export function normalizeMrPhone(input: string): string {
  let digits = input.replace(/[\s.-]/g, "");
  digits = digits.replace(/^\+?00?222/, "").replace(/^\+/, "");
  if (/^222\d{8}$/.test(digits)) digits = digits.slice(3); // 222 résiduel devant 8 chiffres
  if (!/^\d{8}$/.test(digits)) {
    throw errors.badRequest(
      "Numéro de téléphone invalide (8 chiffres mauritaniens attendus)",
      "INVALID_PHONE",
    );
  }
  return digits;
}

/** Email dédié dérivé du téléphone : <8 chiffres>@nathafty.mr. */
export function deriveEmail(phone8: string): string {
  return `${phone8}@${EMAIL_DOMAIN}`;
}

/** POST /api/customer/register */
export const registerCustomerDto = z.object({
  phone: z.string().min(1),
  password: z.string().min(6, "Mot de passe trop court (min 6 caractères)"),
  name: z.string().min(1).max(255),
  address: z.string().max(2000).optional(),
  whatsapp: z.string().max(20).optional(),
  district_id: z.number().int().positive().optional(),
  family_size: z.number().int().positive().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});
export type RegisterCustomerDto = z.infer<typeof registerCustomerDto>;

/** POST /api/customer/login */
export const loginCustomerDto = z.object({
  phone: z.string().min(1),
  password: z.string().min(1),
});
export type LoginCustomerDto = z.infer<typeof loginCustomerDto>;
