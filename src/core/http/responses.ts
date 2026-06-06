import { z } from "zod";
import { AppError } from "./errors";

/** Réponse succès : { data: ... } avec le status voulu (200 par défaut, 201 à la création). */
export function ok(data: unknown, status = 200): Response {
  return Response.json({ data }, { status });
}

/** Réponse erreur : { error: { code, message } }. */
function fail(code: string, message: string, status: number): Response {
  return Response.json({ error: { code, message } }, { status });
}

/**
 * Convertit n'importe quelle erreur levée dans un handler en Response :
 * - AppError       -> son status / code / message
 * - ZodError       -> 400 VALIDATION_ERROR (premier message lisible)
 * - tout le reste  -> 500 INTERNAL (message générique, détail loggé serveur)
 */
export function toErrorResponse(err: unknown): Response {
  if (err instanceof AppError) {
    return fail(err.code, err.message, err.httpStatus);
  }
  if (err instanceof z.ZodError) {
    const first = err.issues[0];
    const path = first?.path.join(".");
    const message = path ? `${path}: ${first.message}` : (first?.message ?? "Payload invalide");
    return fail("VALIDATION_ERROR", message, 400);
  }
  console.error("[withRoute] Erreur non gérée :", err);
  return fail("INTERNAL", "Erreur interne du serveur", 500);
}
