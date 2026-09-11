"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Home, BadgeCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { EmptyState } from "@/components/admin/empty-state";
import { HouseholdValidateAction } from "./household-validate-action";
import { formatDate } from "@/lib/format";
import type { HouseholdListRow } from "@/core/repositories/householdRepo";
import type { DistrictRow } from "@/core/repositories/districtRepo";

const TYPE_LABEL: Record<string, string> = {
  MAISON: "Maison",
  ETABLISSEMENT: "Établissement",
};

function columns(pending: boolean): ColumnDef<HouseholdListRow>[] {
  const base: ColumnDef<HouseholdListRow>[] = [
    {
      accessorKey: "name",
      header: "Nom",
      cell: ({ row }) => (
        <Link href={`/admin/households/${row.original.id}`} className="font-medium hover:underline">
          {row.original.name}
        </Link>
      ),
    },
    { accessorKey: "phone", header: "Téléphone", cell: ({ row }) => row.original.phone ?? "—" },
    { accessorKey: "type", header: "Type", cell: ({ row }) => TYPE_LABEL[row.original.type] ?? row.original.type },
    {
      accessorKey: "registration_date",
      header: "Inscrit le",
      cell: ({ row }) => formatDate(row.original.registration_date),
    },
  ];
  if (!pending) {
    base.push({
      accessorKey: "actif_remaining_days",
      header: "Jours restants",
      cell: ({ row }) => row.original.actif_remaining_days,
    });
  }
  base.push({ accessorKey: "status", header: "Statut", cell: ({ row }) => <StatusBadge status={row.original.status} /> });
  if (pending) {
    base.push({ id: "actions", cell: ({ row }) => <div className="flex justify-end"><HouseholdValidateAction id={row.original.id} /></div> });
  }
  return base;
}

function HouseholdCard({ row, pending }: { row: HouseholdListRow; pending: boolean }) {
  return (
    <div className="rounded-md border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link href={`/admin/households/${row.id}`} className="font-medium hover:underline">
            {row.name}
          </Link>
          <p className="text-sm text-muted-foreground">{row.phone ?? "—"}</p>
        </div>
        <StatusBadge status={row.status} />
      </div>
      <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
        <span>{TYPE_LABEL[row.type] ?? row.type}</span>
        <span>{formatDate(row.registration_date)}</span>
      </div>
      {pending && (
        <div className="mt-3 flex justify-end">
          <HouseholdValidateAction id={row.id} />
        </div>
      )}
    </div>
  );
}

export function HouseholdsView({
  households,
  districts,
}: {
  households: HouseholdListRow[];
  districts: DistrictRow[];
}) {
  const [districtFilter, setDistrictFilter] = useState("all");

  const filtered = useMemo(
    () =>
      districtFilter === "all"
        ? households
        : households.filter((h) => String(h.district_id ?? "") === districtFilter),
    [households, districtFilter],
  );
  const pending = filtered.filter((h) => h.status === "PENDING");
  const valid = filtered.filter((h) => h.status === "VALID");

  return (
    <Tabs defaultValue="pending">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabsList>
          <TabsTrigger value="pending">À valider{pending.length > 0 ? ` (${pending.length})` : ""}</TabsTrigger>
          <TabsTrigger value="valid">Validés</TabsTrigger>
        </TabsList>
        <Select value={districtFilter} onValueChange={setDistrictFilter}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les districts</SelectItem>
            {districts.map((d) => (
              <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <TabsContent value="pending" className="mt-4">
        <DataTable
          columns={columns(true)}
          data={pending}
          searchPlaceholder="Rechercher un ménage…"
          emptyMessage={<EmptyState title="Aucun ménage en attente" description="Toutes les inscriptions sont traitées." icon={BadgeCheck} />}
          renderCard={(row) => <HouseholdCard row={row} pending />}
        />
      </TabsContent>

      <TabsContent value="valid" className="mt-4">
        <DataTable
          columns={columns(false)}
          data={valid}
          searchPlaceholder="Rechercher un ménage…"
          emptyMessage={<EmptyState title="Aucun ménage validé" icon={Home} />}
          renderCard={(row) => <HouseholdCard row={row} pending={false} />}
        />
      </TabsContent>
    </Tabs>
  );
}
