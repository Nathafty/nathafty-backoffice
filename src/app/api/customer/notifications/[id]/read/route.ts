import { errors, ok, withRoute } from "@/core/http";
import { notificationService } from "@/core/services/notification";

export const POST = withRoute<{ id: string }>(async ({ ctx, params }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw errors.badRequest("Identifiant de notification invalide");
  }
  const updated = await notificationService.markRead(ctx.supabase, ctx.userId, id);
  if (!updated) throw errors.notFound("Notification introuvable");
  return ok(updated);
});
