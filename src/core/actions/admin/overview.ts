"use server";

import { getServiceClient } from "@/lib/supabase/service";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Premier jour du mois courant (offset=0) ou d'un mois précédent (offset=-1, etc.), au format ISO date. */
function monthStartIso(offset = 0): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + offset, 1).toISOString().slice(0, 10);
}

/** Lundi de la semaine contenant `d` (minuit local), au format ISO date. */
function mondayIso(d: Date): string {
  const date = new Date(d);
  const day = date.getDay();
  date.setDate(date.getDate() + (day === 0 ? -6 : 1 - day));
  date.setHours(0, 0, 0, 0);
  return date.toISOString().slice(0, 10);
}

export interface AdminOverview {
  pendingHouseholds: number;
  todayCollections: number;
  pendingRenewals: number;
  monthExpensesTotal: number;
  /** Total du mois précédent, pour afficher une variation. `null` si non calculable. */
  prevMonthExpensesTotal: number | null;
}

export interface WeekPoint {
  weekStart: string;
  label: string;
  count: number;
}

export interface CategorySlice {
  category: string;
  label: string;
  amount: number;
}

export interface RenewalRate {
  /** Taux d'approbation (%) sur les 30 derniers jours, parmi les demandes traitées (approuvées/rejetées). `null` si aucune demande traitée. */
  current: number | null;
  /** Même calcul sur les 30 jours précédents, pour la variation. */
  previous: number | null;
}

const CATEGORY_LABEL: Record<string, string> = {
  carburant: "Carburant",
  salaire: "Salaire",
  maintenance: "Maintenance",
  autre: "Autre",
};

/** Compteurs de la page d'accueil admin. Résilient si la table expenses n'existe pas encore. */
export async function adminOverview(): Promise<AdminOverview> {
  const db = getServiceClient();

  const [pending, today, renewals] = await Promise.all([
    db.from("households").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
    db.from("collections").select("*", { count: "exact", head: true }).eq("scheduled_date", todayIso()),
    db.from("renewal_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  let monthExpensesTotal = 0;
  let prevMonthExpensesTotal: number | null = null;
  try {
    const [current, previous] = await Promise.all([
      db.from("expenses").select("amount_mru").gte("expense_date", monthStartIso()),
      db
        .from("expenses")
        .select("amount_mru")
        .gte("expense_date", monthStartIso(-1))
        .lt("expense_date", monthStartIso()),
    ]);
    monthExpensesTotal = (current.data ?? []).reduce(
      (s, r) => s + Number((r as { amount_mru: number }).amount_mru ?? 0),
      0,
    );
    prevMonthExpensesTotal = (previous.data ?? []).reduce(
      (s, r) => s + Number((r as { amount_mru: number }).amount_mru ?? 0),
      0,
    );
  } catch {
    monthExpensesTotal = 0;
    prevMonthExpensesTotal = null;
  }

  return {
    pendingHouseholds: pending.count ?? 0,
    todayCollections: today.count ?? 0,
    pendingRenewals: renewals.count ?? 0,
    monthExpensesTotal,
    prevMonthExpensesTotal,
  };
}

/** Nombre de collectes planifiées par semaine (lundi de départ), sur les `weeks` dernières semaines. */
export async function collectionsTrend(weeks = 10): Promise<WeekPoint[]> {
  const db = getServiceClient();
  const start = new Date();
  start.setDate(start.getDate() - (weeks - 1) * 7);
  const startIso = mondayIso(start);

  const buckets = new Map<string, number>();
  for (let i = 0; i < weeks; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i * 7);
    buckets.set(mondayIso(d), 0);
  }

  try {
    const { data } = await db.from("collections").select("scheduled_date").gte("scheduled_date", startIso);
    for (const row of data ?? []) {
      const date = (row as { scheduled_date: string | null }).scheduled_date;
      if (!date) continue;
      const week = mondayIso(new Date(date));
      if (buckets.has(week)) buckets.set(week, (buckets.get(week) ?? 0) + 1);
    }
  } catch {
    /* table absente ou vide : buckets restent à 0 */
  }

  return Array.from(buckets.entries()).map(([weekStart, count]) => ({
    weekStart,
    label: new Date(weekStart).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
    count,
  }));
}

/** Répartition des dépenses du mois courant par catégorie. */
export async function expensesByCategory(): Promise<CategorySlice[]> {
  const db = getServiceClient();
  const totals = new Map<string, number>();
  try {
    const { data } = await db.from("expenses").select("category, amount_mru").gte("expense_date", monthStartIso());
    for (const row of data ?? []) {
      const r = row as { category: string; amount_mru: number };
      totals.set(r.category, (totals.get(r.category) ?? 0) + Number(r.amount_mru ?? 0));
    }
  } catch {
    /* table absente : liste vide */
  }
  return Array.from(totals.entries())
    .map(([category, amount]) => ({ category, label: CATEGORY_LABEL[category] ?? category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

/** Taux d'approbation des demandes de renouvellement, période courante (30j) vs précédente (30j). */
export async function renewalRate(): Promise<RenewalRate> {
  const db = getServiceClient();
  const now = new Date();
  const periodStart = new Date(now);
  periodStart.setDate(periodStart.getDate() - 30);
  const prevPeriodStart = new Date(now);
  prevPeriodStart.setDate(prevPeriodStart.getDate() - 60);

  function rateFor(rows: { status: string }[]): number | null {
    const approved = rows.filter((r) => r.status === "approved").length;
    const rejected = rows.filter((r) => r.status === "rejected").length;
    const treated = approved + rejected;
    return treated === 0 ? null : Math.round((approved / treated) * 100);
  }

  try {
    const [current, previous] = await Promise.all([
      db.from("renewal_requests").select("status").gte("requested_at", periodStart.toISOString()),
      db
        .from("renewal_requests")
        .select("status")
        .gte("requested_at", prevPeriodStart.toISOString())
        .lt("requested_at", periodStart.toISOString()),
    ]);
    return {
      current: rateFor((current.data ?? []) as { status: string }[]),
      previous: rateFor((previous.data ?? []) as { status: string }[]),
    };
  } catch {
    return { current: null, previous: null };
  }
}
