/**
 * Erreur applicative portant un code métier, un message et un status HTTP.
 * `withRoute` la convertit en réponse JSON { error: { code, message } }.
 */
export class AppError extends Error {
  readonly code: string;
  readonly httpStatus: number;

  constructor(code: string, message: string, httpStatus: number) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

export const errors = {
  badRequest: (message = "Requête invalide", code = "BAD_REQUEST") =>
    new AppError(code, message, 400),
  unauthorized: (message = "Authentification requise", code = "UNAUTHORIZED") =>
    new AppError(code, message, 401),
  forbidden: (message = "Accès interdit", code = "FORBIDDEN") =>
    new AppError(code, message, 403),
  notFound: (message = "Ressource introuvable", code = "NOT_FOUND") =>
    new AppError(code, message, 404),
  conflict: (message = "Conflit", code = "CONFLICT") =>
    new AppError(code, message, 409),
  internal: (message = "Erreur interne", code = "INTERNAL") =>
    new AppError(code, message, 500),
};
