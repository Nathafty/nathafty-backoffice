import { z } from "zod";

export const complaintCategory = z.enum([
  "missed_collection",
  "damage",
  "billing",
  "other",
]);

/** POST /api/customer/complaints */
export const createComplaintDto = z.object({
  category: complaintCategory,
  description: z.string().min(1).max(5000),
  photo_url: z.string().url().optional(),
});

export type CreateComplaintDto = z.infer<typeof createComplaintDto>;
