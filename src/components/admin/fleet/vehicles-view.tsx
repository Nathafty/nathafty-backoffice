"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Truck } from "lucide-react";
import { DataTable } from "@/components/admin/data-table";
import { EmptyState } from "@/components/admin/empty-state";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { VehicleDialog } from "./vehicle-dialog";
import { ToggleActiveButton } from "./toggle-active-button";
import type { VehicleItem } from "@/core/actions/admin/fleet";

export function VehiclesView({
  vehicles,
  drivers,
}: {
  vehicles: VehicleItem[];
  drivers: { id: number; name: string }[];
}) {
  const columns: ColumnDef<VehicleItem>[] = [
    { accessorKey: "license_plate", header: "Immatriculation", cell: ({ row }) => <span className="font-medium">{row.original.license_plate}</span> },
    { accessorKey: "type", header: "Type", cell: ({ row }) => row.original.type ?? "—" },
    { id: "driver", header: "Collecteur assigné", cell: ({ row }) => row.original.driver_name ?? "—" },
    { id: "status", header: "Statut", cell: ({ row }) => <StatusBadge status={row.original.is_active ? "ACTIVE" : "INACTIVE"} /> },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <VehicleDialog
            vehicle={row.original}
            drivers={drivers}
            trigger={<Button variant="ghost" size="icon" aria-label="Éditer"><Pencil className="size-4" /></Button>}
          />
          <ToggleActiveButton
            path={`/api/admin/vehicles/${row.original.id}`}
            isActive={row.original.is_active}
            label="ce véhicule"
          />
        </div>
      ),
    },
  ];

  function renderCard(row: VehicleItem) {
    return (
      <div className="rounded-md border bg-card p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium">{row.license_plate}</p>
            <p className="text-sm text-muted-foreground">{row.type ?? "—"}</p>
          </div>
          <StatusBadge status={row.is_active ? "ACTIVE" : "INACTIVE"} />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{row.driver_name ?? "Aucun collecteur assigné"}</p>
        <div className="mt-3 flex justify-end gap-1">
          <VehicleDialog
            vehicle={row}
            drivers={drivers}
            trigger={<Button variant="ghost" size="icon" aria-label="Éditer"><Pencil className="size-4" /></Button>}
          />
          <ToggleActiveButton path={`/api/admin/vehicles/${row.id}`} isActive={row.is_active} label="ce véhicule" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <VehicleDialog drivers={drivers} trigger={<Button><Plus className="mr-2 size-4" /> Nouveau véhicule</Button>} />
      </div>
      <DataTable
        columns={columns}
        data={vehicles}
        searchPlaceholder="Rechercher une immatriculation…"
        emptyMessage={<EmptyState title="Aucun véhicule" description="Ajoutez un véhicule pour commencer." icon={Truck} />}
        renderCard={renderCard}
      />
    </div>
  );
}
