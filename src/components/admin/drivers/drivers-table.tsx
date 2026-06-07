"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { MoreHorizontal } from "lucide-react";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
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
    <DataTable columns={columns} data={data} searchPlaceholder="Rechercher un collecteur…" emptyMessage="Aucun collecteur." />
  );
}
