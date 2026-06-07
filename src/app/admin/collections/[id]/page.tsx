import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { CollectionForm } from "@/components/admin/collections/collection-form";
import { getCollectionDetail, planningOptions } from "@/core/actions/admin/collections";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

interface HouseRow {
  id: number;
  status: string | null;
  households: { id: string; name: string; address: string | null } | null;
}

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collectionId = Number(id);
  if (!Number.isInteger(collectionId)) notFound();

  const [detail, options] = await Promise.all([
    getCollectionDetail(collectionId),
    planningOptions(),
  ]);
  if (!detail) notFound();

  const { collection } = detail;
  const houses = detail.houses as unknown as HouseRow[];
  const householdIds = houses.map((h) => h.households?.id).filter(Boolean) as string[];

  return (
    <div className="space-y-6">
      <PageHeader title={collection.title} description={`Collecte #${collection.id}`} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Informations</CardTitle>
          <StatusBadge status={collection.status} />
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <div><span className="text-muted-foreground">Date prévue : </span>{formatDate(collection.scheduled_date)}</div>
          <div><span className="text-muted-foreground">Zone : </span>{collection.zone ?? "—"}</div>
          <div><span className="text-muted-foreground">Maisons : </span>{houses.length}</div>
          <div><span className="text-muted-foreground">Fin : </span>{formatDate(collection.end_date)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Maisons de la tournée</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ménage</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {houses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-20 text-center text-muted-foreground">
                    Aucune maison.
                  </TableCell>
                </TableRow>
              ) : (
                houses.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="font-medium">{h.households?.name ?? "—"}</TableCell>
                    <TableCell>{h.households?.address ?? "—"}</TableCell>
                    <TableCell><StatusBadge status={h.status} /></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Modifier la collecte</CardTitle>
        </CardHeader>
        <CardContent>
          <CollectionForm
            drivers={options.drivers}
            households={options.households}
            collectionId={collection.id}
            initial={{
              title: collection.title,
              zone: collection.zone,
              scheduled_date: collection.scheduled_date,
              end_date: collection.end_date,
              driver_id: collection.driver_id,
              household_ids: householdIds,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
