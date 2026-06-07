"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { formatDate, formatMru } from "@/lib/format";
import { RenewalActions } from "./renewal-actions";
import { PlanDialog } from "./plan-dialog";
import type {
  RenewalListItem,
  SubscriptionListItem,
} from "@/core/actions/admin/subscriptions";
import type { PlanRow } from "@/core/repositories/subscriptionPlanRepo";

const renewalColumns: ColumnDef<RenewalListItem>[] = [
  { accessorKey: "household_name", header: "Ménage", cell: ({ row }) => row.original.household_name ?? row.original.household_id },
  { accessorKey: "plan_name", header: "Plan", cell: ({ row }) => row.original.plan_name ?? "—" },
  { accessorKey: "price_mru", header: "Prix", cell: ({ row }) => formatMru(row.original.price_mru) },
  { accessorKey: "requested_at", header: "Demandé le", cell: ({ row }) => formatDate(row.original.requested_at) },
  { accessorKey: "status", header: "Statut", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  {
    id: "actions",
    cell: ({ row }) =>
      row.original.status === "pending" ? <RenewalActions id={row.original.id} /> : null,
  },
];

const subColumns: ColumnDef<SubscriptionListItem>[] = [
  { accessorKey: "household_name", header: "Ménage", cell: ({ row }) => row.original.household_name ?? "—" },
  { accessorKey: "plan_name", header: "Plan", cell: ({ row }) => row.original.plan_name ?? "—" },
  { accessorKey: "start_date", header: "Début", cell: ({ row }) => formatDate(row.original.start_date) },
  { accessorKey: "end_date", header: "Fin", cell: ({ row }) => formatDate(row.original.end_date) },
  { accessorKey: "status", header: "Statut", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
];

const planColumns: ColumnDef<PlanRow>[] = [
  { accessorKey: "name", header: "Nom" },
  { accessorKey: "code", header: "Code" },
  { accessorKey: "price_mru", header: "Prix", cell: ({ row }) => formatMru(row.original.price_mru) },
  { accessorKey: "duration_days", header: "Durée", cell: ({ row }) => `${row.original.duration_days} j` },
  { accessorKey: "collections_per_week", header: "Collectes/sem." },
  { accessorKey: "is_active", header: "Actif", cell: ({ row }) => <StatusBadge status={row.original.is_active ? "active" : "expired"} /> },
  { id: "actions", cell: ({ row }) => <div className="flex justify-end"><PlanDialog plan={row.original} /></div> },
];

export function SubscriptionsView({
  renewals,
  subscriptions,
  plans,
}: {
  renewals: RenewalListItem[];
  subscriptions: SubscriptionListItem[];
  plans: PlanRow[];
}) {
  const pendingCount = renewals.filter((r) => r.status === "pending").length;
  return (
    <Tabs defaultValue="renewals">
      <TabsList>
        <TabsTrigger value="renewals">
          Renouvellements{pendingCount > 0 ? ` (${pendingCount})` : ""}
        </TabsTrigger>
        <TabsTrigger value="subs">Abonnements</TabsTrigger>
        <TabsTrigger value="plans">Plans</TabsTrigger>
      </TabsList>

      <TabsContent value="renewals" className="mt-4">
        <DataTable columns={renewalColumns} data={renewals} emptyMessage="Aucune demande de renouvellement." />
      </TabsContent>

      <TabsContent value="subs" className="mt-4">
        <DataTable columns={subColumns} data={subscriptions} searchPlaceholder="Rechercher…" emptyMessage="Aucun abonnement." />
      </TabsContent>

      <TabsContent value="plans" className="mt-4 space-y-3">
        <div className="flex justify-end">
          <PlanDialog />
        </div>
        <DataTable columns={planColumns} data={plans} emptyMessage="Aucun plan." />
      </TabsContent>
    </Tabs>
  );
}
