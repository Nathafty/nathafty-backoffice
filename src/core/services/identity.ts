import "server-only";
import { type AppContext } from "@/core/http/context";
import { errors } from "@/core/http/errors";

/**
 * Résout le ménage (household) lié à l'utilisateur connecté.
 * Lien : households.user_id = auth.uid().
 * 403 si aucun ménage n'est rattaché (compte non provisionné côté Nathafty).
 */
export async function getHouseholdForUser(ctx: AppContext): Promise<{ id: string }> {
  const { data, error } = await ctx.supabase
    .from("households")
    .select("id")
    .eq("user_id", ctx.userId)
    .maybeSingle();

  if (error) throw errors.internal(error.message);
  if (!data) {
    throw errors.forbidden(
      "Aucun ménage rattaché à ce compte. Contactez Nathafty.",
      "HOUSEHOLD_NOT_LINKED",
    );
  }
  return { id: data.id as string };
}

/**
 * Résout le collecteur (driver) lié à l'utilisateur connecté.
 * Exige le rôle applicatif 'driver' ET une ligne drivers.user_id = auth.uid().
 */
export async function getDriverForUser(ctx: AppContext): Promise<{ id: number }> {
  if (ctx.role !== "driver") {
    throw errors.forbidden("Rôle collecteur requis", "DRIVER_ROLE_REQUIRED");
  }

  const { data, error } = await ctx.supabase
    .from("drivers")
    .select("id")
    .eq("user_id", ctx.userId)
    .maybeSingle();

  if (error) throw errors.internal(error.message);
  if (!data) {
    throw errors.forbidden(
      "Aucun collecteur rattaché à ce compte.",
      "DRIVER_NOT_LINKED",
    );
  }
  return { id: data.id as number };
}
