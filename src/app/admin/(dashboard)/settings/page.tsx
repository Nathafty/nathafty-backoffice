import Link from "next/link";
import { ArrowRight, BadgeCheck, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/page-header";
import { AccountsView } from "@/components/admin/settings/accounts-view";
import { listAdminAccounts } from "@/core/actions/admin/accounts";
import { getCurrentAdminRole } from "@/core/actions/admin/session";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [accounts, role] = await Promise.all([listAdminAccounts(), getCurrentAdminRole()]);

  return (
    <div className="space-y-6">
      <PageHeader title="Paramètres" description="Comptes gérant/admin et configuration de l'application." />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comptes admin/gérant</CardTitle>
        </CardHeader>
        <CardContent>
          <AccountsView accounts={accounts} canCreate={role === "super_admin"} />
          {role !== "super_admin" && (
            <p className="mt-3 text-xs text-muted-foreground">
              Seul un super_admin peut créer un nouveau compte admin/gérant.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/drivers" className="block">
          <Card className="transition-colors hover:bg-muted/50">
            <CardContent className="flex items-center justify-between gap-3 py-5">
              <div className="flex items-center gap-3">
                <Users className="size-5 text-muted-foreground" aria-hidden />
                <div>
                  <p className="font-medium">Comptes collecteurs</p>
                  <p className="text-sm text-muted-foreground">Créer et gérer les comptes des collecteurs.</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" aria-hidden />
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/subscriptions" className="block">
          <Card className="transition-colors hover:bg-muted/50">
            <CardContent className="flex items-center justify-between gap-3 py-5">
              <div className="flex items-center gap-3">
                <BadgeCheck className="size-5 text-muted-foreground" aria-hidden />
                <div>
                  <p className="font-medium">Catalogue d&apos;abonnements</p>
                  <p className="text-sm text-muted-foreground">Prix, durée et fréquence des plans proposés.</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" aria-hidden />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
