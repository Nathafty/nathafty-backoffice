import Link from "next/link";
import { Clock, Truck, RefreshCw, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminOverview } from "@/core/actions/admin/overview";
import { formatMru } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const o = await adminOverview();

  const cards = [
    { label: "Ménages en attente", value: o.pendingHouseholds, icon: Clock, href: "/admin/subscriptions", hint: "à valider" },
    { label: "Collectes aujourd'hui", value: o.todayCollections, icon: Truck, href: "/admin/collections", hint: "planifiées" },
    { label: "Renouvellements", value: o.pendingRenewals, icon: RefreshCw, href: "/admin/subscriptions", hint: "en attente" },
    { label: "Dépenses du mois", value: formatMru(o.monthExpensesTotal), icon: Wallet, href: "/admin/expenses", hint: "cumul" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Tableau de bord</h2>
        <p className="text-sm text-muted-foreground">Vue d&apos;ensemble de l&apos;activité Nathafty.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
      </div>
    </div>
  );
}
