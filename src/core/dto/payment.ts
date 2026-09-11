import { z } from "zod";

export const paymentStatus = z.enum(["pending", "paid", "rejected"]);

export const paymentFilterQuery = z.object({
  status: paymentStatus.optional(),
  payment_method: z.string().max(50).optional(),
  household_id: z.string().max(20).optional(),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
export type PaymentFilterQuery = z.infer<typeof paymentFilterQuery>;

export const updatePaymentStatusDto = z.object({ status: paymentStatus });
export type UpdatePaymentStatusDto = z.infer<typeof updatePaymentStatusDto>;
