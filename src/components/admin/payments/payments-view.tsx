"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { CreditCard } from "lucide-react";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { EmptyState } from "@/components/admin/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, formatMru } from "@/lib/format";
import type { PaymentItem } from "@/core/actions/admin/payments";

const STATUS_OPTIONS = [
  { value: "pending", label: "En attente" },
  { value: "paid", label: "Payé" },
  { value: "rejected", label: "Rejeté" },
];

const METHOD_OPTIONS = ["Bankily", "Masrivi", "Sedad", "Cash"];

export function PaymentsView({ payments }: { payments: PaymentItem[] }) {
  const [status, setStatus] = useState("all");
  const [method, setMethod] = useState("all");
  const [household, setHousehold] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (method !== "all" && (p.payment_method ?? "").toLowerCase() !== method.toLowerCase()) return false;
      if (household.trim() && !(p.household_name ?? "").toLowerCase().includes(household.trim().toLowerCase())) return false;
      if (from && p.due_date < from) return false;
      if (to && p.due_date > to) return false;
      return true;
    });
  }, [payments, status, method, household, from, to]);

  const columns: ColumnDef<PaymentItem>[] = [
    {
      id: "household",
      header: "Ménage",
      cell: ({ row }) => (
        <Link href={`/admin/payments/${row.original.id}`} className="font-medium hover:underline">
          {row.original.household_name ?? "—"}
        </Link>
      ),
    },
    { accessorKey: "amount", header: "Montant", cell: ({ row }) => formatMru(row.original.amount) },
    { accessorKey: "due_date", header: "Échéance", cell: ({ row }) => formatDate(row.original.due_date) },
    { accessorKey: "payment_method", header: "Méthode", cell: ({ row }) => row.original.payment_method ?? "—" },
    { id: "status", header: "Statut", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  ];

  function renderCard(row: PaymentItem) {
    return (
      <Link href={`/admin/payments/${row.id}`} className="block rounded-md border bg-card p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium">{row.household_name ?? "—"}</p>
            <p className="text-sm text-muted-foreground">{formatDate(row.due_date)}</p>
          </div>
          <StatusBadge status={row.status} />
        </div>
        <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
          <span>{row.payment_method ?? "—"}</span>
          <span className="font-medium text-foreground">{formatMru(row.amount)}</span>
        </div>
      </Link>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-1.5">
          <Label>Statut</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Méthode</Label>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les méthodes</SelectItem>
              {METHOD_OPTIONS.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="hh">Ménage</Label>
          <Input id="hh" value={household} onChange={(e) => setHousehold(e.target.value)} placeholder="Rechercher…" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="from">Du</Label>
          <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="to">Au</Label>
          <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        emptyMessage={<EmptyState title="Aucun paiement" description="Aucun paiement ne correspond aux filtres." icon={CreditCard} />}
        renderCard={renderCard}
      />
    </div>
  );
}
