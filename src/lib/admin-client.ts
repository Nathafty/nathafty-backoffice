"use client";

/**
 * Helper client pour appeler les routes d'écriture admin (/api/admin/*).
 * Gère l'enveloppe { data } / { error: { code, message } } et lève une Error
 * lisible (message serveur) en cas d'échec, à afficher via un toast.
 */
export async function apiPost<T = unknown>(
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    /* réponse sans corps */
  }
  if (!res.ok) {
    const message =
      (json as { error?: { message?: string } } | null)?.error?.message ??
      `Erreur ${res.status}`;
    throw new Error(message);
  }
  return (json as { data: T }).data;
}
