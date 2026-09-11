"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { MoreHorizontal, Users } from "lucide-react";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { EmptyState } from "@/components/admin/empty-state";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiPost } from "@/lib/admin-client";
import type { DriverRow } from "@/core/repositories/driverRepo";

const STATUSES = [
  { value: "ACTIVE", label: "Activer" },
  { value: "INACTIVE", label: "Désactiver" },
  { value: "SUSPENDED", label: "Suspendre" },
];

function RowActions({ row }: { row: DriverRow }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function setStatus(status: string) {
    setBusy(true);
    try {
      await apiPost(`/api/admin/drivers/${row.id}/status`, { status });
      toast.success("Statut mis à jour");
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={busy} aria-label="Actions">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/admin/drivers/${row.id}`}>Voir la fiche</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Statut</DropdownMenuLabel>
          {STATUSES.map((s) => (
            <DropdownMenuItem key={s.value} disabled={row.status === s.value} onClick={() => setStatus(s.value)}>
              {s.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function DriverCard({ row }: { row: DriverRow }) {
  return (
    <div className="rounded-md border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link href={`/admin/drivers/${row.id}`} className="font-medium hover:underline">
            {row.name}
          </Link>
          <p className="text-sm text-muted-foreground">{row.phone ?? "—"}</p>
        </div>
        <RowActions row={row} />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">NNI : {row.nni ?? "—"}</span>
        <StatusBadge status={row.status} />
      </div>
    </div>
  );
}

const columns: ColumnDef<DriverRow>[] = [
  {
    accessorKey: "name",
    header: "Nom",
    cell: ({ row }) => (
      <Link href={`/admin/drivers/${row.original.id}`} className="font-medium hover:underline">
        {row.original.name}
      </Link>
    ),
  },
  { accessorKey: "phone", header: "Téléphone", cell: ({ row }) => row.original.phone ?? "—" },
  { accessorKey: "nni", header: "NNI", cell: ({ row }) => row.original.nni ?? "—" },
  { accessorKey: "status", header: "Statut", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  { id: "actions", cell: ({ row }) => <RowActions row={row.original} /> },
];

export function DriversTable({ data }: { data: DriverRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Rechercher un collecteur…"
      emptyMessage={
        <EmptyState title="Aucun collecteur" description="Ajoutez votre premier collecteur pour commencer." icon={Users} />
      }
      renderCard={(row) => <DriverCard row={row} />}
    />
  );
}
