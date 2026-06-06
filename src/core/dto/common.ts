import { z } from "zod";

/** Date au format ISO court AAAA-MM-JJ. */
export const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date attendue au format AAAA-MM-JJ");

/** Query { from, to } pour les endpoints à période (calendrier, historique). */
export const dateRangeQuery = z
  .object({ from: isoDate, to: isoDate })
  .refine((v) => v.from <= v.to, {
    message: "from doit être <= to",
    path: ["from"],
  });
export type DateRange = z.infer<typeof dateRangeQuery>;

/** Coordonnées GPS. */
export const latitude = z.coerce.number().min(-90).max(90);
export const longitude = z.coerce.number().min(-180).max(180);

/** Helper : parse les query params d'une URL avec un schéma Zod. */
export function parseQuery<T extends z.ZodType>(
  url: string,
  schema: T,
): z.infer<T> {
  const params = Object.fromEntries(new URL(url).searchParams.entries());
  return schema.parse(params);
}
