import { errors, ok } from "@/core/http";
import { withAdminRoute } from "@/core/http/withAdminRoute";
import { accountAdminService } from "@/core/services/admin/accountAdmin";
import { createAdminAccountDto } from "@/core/dto/account";

/**
 * Création de compte gérant/admin : réservée à super_admin. `withAdminRoute` autorise déjà
 * admin/super_admin de façon identique partout ailleurs — c'est la première route qui
 * introduit une distinction de rôle, car un admin classique ne doit pas pouvoir créer
 * (ni s'auto-élever vers) un compte super_admin.
 */
export const POST = withAdminRoute(async ({ req, role, supabase }) => {
  if (role !== "super_admin") {
    throw errors.forbidden("Seul un super_admin peut créer un compte admin", "SUPER_ADMIN_REQUIRED");
  }
  const dto = createAdminAccountDto.parse(await req.json());
  return ok(await accountAdminService.createAdminAccount(supabase, dto), 201);
});
