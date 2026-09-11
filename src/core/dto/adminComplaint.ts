import { z } from "zod";

export const complaintStatus = z.enum(["open", "in_progress", "resolved", "closed"]);
export const complaintPriority = z.enum(["low", "medium", "high"]);

/** POST /api/admin/complaints/[id]/respond */
export const respondComplaintDto = z
  .object({
    status: complaintStatus.optional(),
    priority: complaintPriority.optional(),
    response: z.string().max(5000).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: "Au moins un champ à mettre à jour",
  });

export type RespondComplaintDto = z.infer<typeof respondComplaintDto>;
