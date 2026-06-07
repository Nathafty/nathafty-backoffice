/** Montant en Ouguiya mauritanien (MRU). */
export function formatMru(amount: number | string | null | undefined): string {
  const n = Number(amount ?? 0);
  return `${n.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} MRU`;
}

/** Date courte (AAAA-MM-JJ ou ISO) → format local lisible. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}
