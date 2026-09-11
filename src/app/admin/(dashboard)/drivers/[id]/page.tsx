import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { DriverDialog } from "@/components/admin/drivers/driver-dialog";
import { getDriverDetail } from "@/core/actions/admin/drivers";

export const dynamic = "force-dynamic";

export default async function DriverDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const driverId = Number(id);
  if (!Number.isInteger(driverId)) notFound();

  const detail = await getDriverDetail(driverId);
  if (!detail) notFound();
  const { driver, stats } = detail;

  const metrics = [
    { label: "Collectes assignées", value: stats.collectionsCount },
    { label: "Maisons collectées", value: stats.housesDone },
    { label: "Maisons totales", value: stats.housesTotal },
    { label: "Taux de réussite", value: `${stats.successRate}%` },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={driver.name}
        description={`Collecteur #${driver.id}`}
        actions={
          <DriverDialog
            driver={driver}
            trigger={
              <Button variant="outline">
                <Pencil className="mr-2 size-4" /> Modifier
              </Button>
            }
          />
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Informations</CardTitle>
          <StatusBadge status={driver.status} />
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <div><span className="text-muted-foreground">Téléphone : </span>{driver.phone ?? "—"}</div>
          <div><span className="text-muted-foreground">NNI : </span>{driver.nni ?? "—"}</div>
          <div><span className="text-muted-foreground">Compte lié : </span>{driver.user_id ? "Oui" : "Non"}</div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{m.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{m.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
