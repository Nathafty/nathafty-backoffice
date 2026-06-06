import { ok, withRoute } from "@/core/http";
import { notificationService } from "@/core/services/notification";
import { notificationsQuery } from "@/core/dto/notification";
import { parseQuery } from "@/core/dto/common";

export const GET = withRoute(async ({ ctx, req }) => {
  const { unread } = parseQuery(req.url, notificationsQuery);
  return ok(await notificationService.list(ctx.supabase, ctx.userId, { unread }));
});
