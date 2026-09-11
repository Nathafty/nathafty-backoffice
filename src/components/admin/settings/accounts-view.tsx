"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Users } from "lucide-react";
import { DataTable } from "@/components/admin/data-table";
import { EmptyState } from "@/components/admin/empty-state";
import { AccountDialog } from "./account-dialog";
import { formatDate } from "@/lib/format";
import type { AdminAccountItem } from "@/core/services/admin/accountAdmin";

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  super_admin: "Super admin",
};

export function AccountsView({
  accounts,
  canCreate,
}: {
  accounts: AdminAccountItem[];
  canCreate: boolean;
}) {
  const columns: ColumnDef<AdminAccountItem>[] = [
    { accessorKey: "email", header: "Email", cell: ({ row }) => row.original.email ?? "—" },
    { id: "role", header: "Rôle", cell: ({ row }) => ROLE_LABEL[row.original.role] ?? row.original.role },
    { accessorKey: "created_at", header: "Créé le", cell: ({ row }) => formatDate(row.original.created_at) },
  ];

  function renderCard(row: AdminAccountItem) {
    return (
      <div className="rounded-md border bg-card p-4">
        <p className="font-medium">{row.email ?? "—"}</p>
        <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>{ROLE_LABEL[row.role] ?? row.role}</span>
          <span>{formatDate(row.created_at)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {canCreate && (
        <div className="flex justify-end">
          <AccountDialog />
        </div>
      )}
      <DataTable
        columns={columns}
        data={accounts}
        searchPlaceholder="Rechercher un email…"
        emptyMessage={<EmptyState title="Aucun compte" description="Aucun compte admin/gérant enregistré." icon={Users} />}
        renderCard={renderCard}
      />
    </div>
  );
}
