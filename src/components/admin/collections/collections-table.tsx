"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { MoreHorizontal, Truck } from "lucide-react";
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
import { formatDate } from "@/lib/format";
import type { CollectionListItem } from "@/core/actions/admin/collections";

const STATUSES: { value: string; label: string }[] = [
  { value: "SCHEDULED", label: "Planifiée" },
  { value: "PROGRESS", label: "En cours" },
  { value: "COMPLETE", label: "Terminée" },
];

function RowActions({ row }: { row: CollectionListItem }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function setStatus(status: string) {
    setBusy(true);
    try {
      await apiPost(`/api/admin/collections/${row.id}/status`, { status });
      toast.success("Statut mis à jour");
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={busy} aria-label="Actions">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/admin/collections/${row.id}`}>Détail / éditer</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Changer le statut</DropdownMenuLabel>
        {STATUSES.map((s) => (
          <DropdownMenuItem
            key={s.value}
            disabled={row.status === s.value}
            onClick={() => setStatus(s.value)}
          >
            {s.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CollectionCard({ row }: { row: CollectionListItem }) {
  return (
    <div className="rounded-md border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link href={`/admin/collections/${row.id}`} className="font-medium hover:underline">
            {row.title}
          </Link>
          <p className="text-sm text-muted-foreground">{formatDate(row.scheduled_date)}</p>
        </div>
        <RowActions row={row} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span>{row.zone ?? "—"}</span>
        <span>{row.driver_name ?? "—"}</span>
        <span>
          {row.houses_done}/{row.houses_total} maisons
        </span>
      </div>
      <div className="mt-3">
        <StatusBadge status={row.status} />
      </div>
    </div>
  );
}

const columns: ColumnDef<CollectionListItem>[] = [
  {
    accessorKey: "title",
    header: "Titre",
    cell: ({ row }) => (
      <Link href={`/admin/collections/${row.original.id}`} className="font-medium hover:underline">
        {row.original.title}
      </Link>
    ),
  },
  { accessorKey: "scheduled_date", header: "Date", cell: ({ row }) => formatDate(row.original.scheduled_date) },
  { accessorKey: "zone", header: "Zone", cell: ({ row }) => row.original.zone ?? "—" },
  { accessorKey: "driver_name", header: "Collecteur", cell: ({ row }) => row.original.driver_name ?? "—" },
  {
    id: "houses",
    header: "Maisons",
    cell: ({ row }) => `${row.original.houses_done}/${row.original.houses_total}`,
  },
  { accessorKey: "status", header: "Statut", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  { id: "actions", cell: ({ row }) => <RowActions row={row.original} /> },
];

export function CollectionsTable({ data }: { data: CollectionListItem[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Rechercher une collecte…"
      emptyMessage={
        <EmptyState title="Aucune collecte planifiée" description="Planifiez une nouvelle collecte pour la voir apparaître ici." icon={Truck} />
      }
      renderCard={(row) => <CollectionCard row={row} />}
    />
  );
}
