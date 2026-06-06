import { ok, withRoute } from "@/core/http";
import { notificationService } from "@/core/services/notification";
import { deviceTokenDto } from "@/core/dto/notification";

export const POST = withRoute(async ({ ctx, req }) => {
  const dto = deviceTokenDto.parse(await req.json());
  await notificationService.registerToken(ctx.supabase, {
    user_id: ctx.userId,
    token: dto.token,
    platform: dto.platform,
    app_flavor: dto.app_flavor ?? null,
  });
  return ok({ registered: true }, 201);
});
