"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, MapPinned } from "lucide-react";
import { DataTable } from "@/components/admin/data-table";
import { EmptyState } from "@/components/admin/empty-state";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { DistrictDialog } from "./district-dialog";
import { ToggleActiveButton } from "./toggle-active-button";
import type { DistrictRow } from "@/core/repositories/districtRepo";

export function DistrictsView({ districts }: { districts: DistrictRow[] }) {
  const columns: ColumnDef<DistrictRow>[] = [
    { accessorKey: "name", header: "Nom", cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    { accessorKey: "code", header: "Code", cell: ({ row }) => row.original.code ?? "—" },
    { accessorKey: "description", header: "Description", cell: ({ row }) => row.original.description ?? "—" },
    { id: "status", header: "Statut", cell: ({ row }) => <StatusBadge status={row.original.is_active ? "ACTIVE" : "INACTIVE"} /> },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <DistrictDialog
            district={row.original}
            trigger={<Button variant="ghost" size="icon" aria-label="Éditer"><Pencil className="size-4" /></Button>}
          />
          <ToggleActiveButton
            path={`/api/admin/districts/${row.original.id}`}
            isActive={row.original.is_active}
            label="ce district"
          />
        </div>
      ),
    },
  ];

  function renderCard(row: DistrictRow) {
    return (
      <div className="rounded-md border bg-card p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium">{row.name}</p>
            <p className="text-sm text-muted-foreground">{row.code ?? "—"}</p>
          </div>
          <StatusBadge status={row.is_active ? "ACTIVE" : "INACTIVE"} />
        </div>
        {row.description && <p className="mt-2 text-sm text-muted-foreground">{row.description}</p>}
        <div className="mt-3 flex justify-end gap-1">
          <DistrictDialog
            district={row}
            trigger={<Button variant="ghost" size="icon" aria-label="Éditer"><Pencil className="size-4" /></Button>}
          />
          <ToggleActiveButton path={`/api/admin/districts/${row.id}`} isActive={row.is_active} label="ce district" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <DistrictDialog trigger={<Button><Plus className="mr-2 size-4" /> Nouveau district</Button>} />
      </div>
      <DataTable
        columns={columns}
        data={districts}
        searchPlaceholder="Rechercher un district…"
        emptyMessage={<EmptyState title="Aucun district" description="Ajoutez un secteur de collecte." icon={MapPinned} />}
        renderCard={renderCard}
      />
    </div>
  );
}
