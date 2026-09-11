"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { MessageCircleWarning } from "lucide-react";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { EmptyState } from "@/components/admin/empty-state";
import { formatDate } from "@/lib/format";
import { CATEGORY_LABEL } from "./category-label";
import type { ComplaintRow } from "@/core/repositories/complaintRepo";

function ComplaintCard({ row }: { row: ComplaintRow }) {
  return (
    <Link href={`/admin/complaints/${row.id}`} className="block rounded-md border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium">{row.ticket_number}</p>
          <p className="text-sm text-muted-foreground">{row.household_name ?? row.household_id ?? "—"}</p>
        </div>
        <StatusBadge status={row.status} />
      </div>
      <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
        <span>{CATEGORY_LABEL[row.category] ?? row.category}</span>
        <span>{formatDate(row.created_at)}</span>
      </div>
    </Link>
  );
}

const columns: ColumnDef<ComplaintRow>[] = [
  {
    accessorKey: "ticket_number",
    header: "Ticket",
    cell: ({ row }) => (
      <Link href={`/admin/complaints/${row.original.id}`} className="font-medium hover:underline">
        {row.original.ticket_number}
      </Link>
    ),
  },
  { accessorKey: "household_name", header: "Ménage", cell: ({ row }) => row.original.household_name ?? row.original.household_id ?? "—" },
  { accessorKey: "category", header: "Catégorie", cell: ({ row }) => CATEGORY_LABEL[row.original.category] ?? row.original.category },
  { accessorKey: "priority", header: "Priorité", cell: ({ row }) => <StatusBadge status={row.original.priority} /> },
  { accessorKey: "status", header: "Statut", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  { accessorKey: "created_at", header: "Reçue le", cell: ({ row }) => formatDate(row.original.created_at) },
];

export function ComplaintsTable({ data }: { data: ComplaintRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Rechercher un ticket, un ménage…"
      emptyMessage={
        <EmptyState title="Aucune réclamation" description="Les réclamations soumises par les ménages apparaîtront ici." icon={MessageCircleWarning} />
      }
      renderCard={(row) => <ComplaintCard row={row} />}
    />
  );
}
