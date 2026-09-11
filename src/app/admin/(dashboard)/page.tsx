import Link from "next/link";
import { Clock, Truck, RefreshCw, Wallet, BadgeCheck, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  adminOverview,
  collectionsTrend,
  expensesByCategory,
  renewalRate,
} from "@/core/actions/admin/overview";
import { formatMru } from "@/lib/format";
import { CollectionsTrendChart } from "@/components/admin/dashboard/collections-trend-chart";
import { ExpensesBreakdownChart } from "@/components/admin/dashboard/expenses-breakdown-chart";

export const dynamic = "force-dynamic";

/** Variation en % entre deux valeurs, `null` si non calculable. */
function percentChange(current: number, previous: number | null): number | null {
  if (previous === null || previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

function TrendBadge({ delta, goodDirection = "up" }: { delta: number | null; goodDirection?: "up" | "down" }) {
  if (delta === null || delta === 0) return null;
  const isUp = delta > 0;
  const isGood = goodDirection === "up" ? isUp : !isUp;
  const Icon = isUp ? ArrowUp : ArrowDown;
  return (
    <p className={`mt-1 flex items-center gap-1 text-xs font-medium ${isGood ? "text-emerald-600" : "text-red-600"}`}>
      <Icon className="size-3" aria-hidden />
      {Math.abs(delta)}% vs période précédente
    </p>
  );
}

export default async function AdminHomePage() {
  const [o, trend, breakdown, renewals] = await Promise.all([
    adminOverview(),
    collectionsTrend(),
    expensesByCategory(),
    renewalRate(),
  ]);

  const expensesDelta = percentChange(o.monthExpensesTotal, o.prevMonthExpensesTotal);
  const renewalDelta =
    renewals.current !== null && renewals.previous !== null ? renewals.current - renewals.previous : null;

  const cards = [
    { label: "Ménages en attente", value: o.pendingHouseholds, icon: Clock, href: "/admin/subscriptions", hint: "à valider" },
    { label: "Collectes aujourd'hui", value: o.todayCollections, icon: Truck, href: "/admin/collections", hint: "planifiées" },
    { label: "Renouvellements", value: o.pendingRenewals, icon: RefreshCw, href: "/admin/subscriptions", hint: "en attente" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Tableau de bord</h2>
        <p className="text-sm text-muted-foreground">Vue d&apos;ensemble de l&apos;activité Nathafty.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map(({ label, value, icon: Icon, href, hint }) => (
          <Link key={label} href={href} className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Card className="transition-colors hover:bg-accent/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <Icon className="size-4 text-muted-foreground" aria-hidden />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{hint}</p>
              </CardContent>
            </Card>
          </Link>
        ))}

        <Link href="/admin/expenses" className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Card className="transition-colors hover:bg-accent/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Dépenses du mois</CardTitle>
              <Wallet className="size-4 text-muted-foreground" aria-hidden />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatMru(o.monthExpensesTotal)}</div>
              <TrendBadge delta={expensesDelta} goodDirection="down" />
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taux de renouvellement</CardTitle>
            <BadgeCheck className="size-4 text-muted-foreground" aria-hidden />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{renewals.current === null ? "—" : `${renewals.current}%`}</div>
            {renewals.current === null ? (
              <p className="text-xs text-muted-foreground">30 derniers jours</p>
            ) : (
              <TrendBadge delta={renewalDelta} goodDirection="up" />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CollectionsTrendChart data={trend} />
        <ExpensesBreakdownChart data={breakdown} />
      </div>
    </div>
  );
}
