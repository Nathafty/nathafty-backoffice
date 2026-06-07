"use server";

import { getServiceClient } from "@/lib/supabase/service";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function monthStartIso(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

export interface AdminOverview {
  pendingHouseholds: number;
  todayCollections: number;
  pendingRenewals: number;
  monthExpensesTotal: number;
}

/** Compteurs de la page d'accueil admin. Résilient si la table expenses n'existe pas encore. */
export async function adminOverview(): Promise<AdminOverview> {
  const db = getServiceClient();

  const [pending, today, renewals] = await Promise.all([
    db.from("households").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
    db.from("collections").select("*", { count: "exact", head: true }).eq("scheduled_date", todayIso()),
    db.from("renewal_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  let monthExpensesTotal = 0;
  try {
    const { data } = await db
      .from("expenses")
      .select("amount_mru")
      .gte("expense_date", monthStartIso());
    monthExpensesTotal = (data ?? []).reduce(
      (s, r) => s + Number((r as { amount_mru: number }).amount_mru ?? 0),
      0,
    );
  } catch {
    monthExpensesTotal = 0;
  }

  return {
    pendingHouseholds: pending.count ?? 0,
    todayCollections: today.count ?? 0,
    pendingRenewals: renewals.count ?? 0,
    monthExpensesTotal,
  };
}
