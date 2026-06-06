import { z } from "zod";

/** POST /api/customer/renewal-request — { plan_id } -> renewal_requests.requested_plan_id. */
export const renewalRequestDto = z.object({
  plan_id: z.number().int().positive(),
});

export type RenewalRequestDto = z.infer<typeof renewalRequestDto>;
