"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { RefreshCw, BadgeCheck, Tag } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { EmptyState } from "@/components/admin/empty-state";
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

function RenewalCard({ row }: { row: RenewalListItem }) {
  return (
    <div className="rounded-md border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium">{row.household_name ?? row.household_id}</p>
          <p className="text-sm text-muted-foreground">{row.plan_name ?? "—"}</p>
        </div>
        <StatusBadge status={row.status} />
      </div>
      <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
        <span>{formatMru(row.price_mru)}</span>
        <span>{formatDate(row.requested_at)}</span>
      </div>
      {row.status === "pending" && (
        <div className="mt-3 flex justify-end">
          <RenewalActions id={row.id} />
        </div>
      )}
    </div>
  );
}

function SubscriptionCard({ row }: { row: SubscriptionListItem }) {
  return (
    <div className="rounded-md border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium">{row.household_name ?? "—"}</p>
        <StatusBadge status={row.status} />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{row.plan_name ?? "—"}</p>
      <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
        <span>Du {formatDate(row.start_date)}</span>
        <span>au {formatDate(row.end_date)}</span>
      </div>
    </div>
  );
}

function PlanCard({ row }: { row: PlanRow }) {
  return (
    <div className="rounded-md border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium">{row.name}</p>
          <p className="text-sm text-muted-foreground">{row.code}</p>
        </div>
        <StatusBadge status={row.is_active ? "active" : "expired"} />
      </div>
      <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
        <span>{formatMru(row.price_mru)}</span>
        <span>
          {row.duration_days} j · {row.collections_per_week} collectes/sem.
        </span>
      </div>
      <div className="mt-3 flex justify-end">
        <PlanDialog plan={row} />
      </div>
    </div>
  );
}

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
        <DataTable
          columns={renewalColumns}
          data={renewals}
          emptyMessage={<EmptyState title="Aucune demande de renouvellement" icon={RefreshCw} />}
          renderCard={(row) => <RenewalCard row={row} />}
        />
      </TabsContent>

      <TabsContent value="subs" className="mt-4">
        <DataTable
          columns={subColumns}
          data={subscriptions}
          searchPlaceholder="Rechercher…"
          emptyMessage={<EmptyState title="Aucun abonnement" icon={BadgeCheck} />}
          renderCard={(row) => <SubscriptionCard row={row} />}
        />
      </TabsContent>

      <TabsContent value="plans" className="mt-4 space-y-3">
        <div className="flex justify-end">
          <PlanDialog />
        </div>
        <DataTable
          columns={planColumns}
          data={plans}
          emptyMessage={<EmptyState title="Aucun plan" description="Créez un plan pour l'ajouter au catalogue." icon={Tag} />}
          renderCard={(row) => <PlanCard row={row} />}
        />
      </TabsContent>
    </Tabs>
  );
}
