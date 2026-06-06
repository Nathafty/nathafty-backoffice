import { z } from "zod";

/** POST /api/customer/device-token */
export const deviceTokenDto = z.object({
  token: z.string().min(1).max(4096),
  platform: z.enum(["android", "ios"]),
  app_flavor: z.string().max(32).optional(),
});
export type DeviceTokenDto = z.infer<typeof deviceTokenDto>;

/** GET /api/customer/notifications?unread=true */
export const notificationsQuery = z
  .object({ unread: z.string().optional() })
  .transform((v) => ({ unread: v.unread === "true" }));
