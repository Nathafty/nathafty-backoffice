"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ExpenseDialog } from "./expense-dialog";
import { apiPost } from "@/lib/admin-client";
import { formatDate, formatMru } from "@/lib/format";
import type { ExpenseItem } from "@/core/actions/admin/expenses";

const CATEGORY_LABEL: Record<string, string> = {
  carburant: "Carburant",
  salaire: "Salaire",
  maintenance: "Maintenance",
  autre: "Autre",
};

interface Options {
  vehicles: { id: number; license_plate: string }[];
  drivers: { id: number; name: string }[];
}

function DeleteButton({ id }: { id: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function del() {
    setBusy(true);
    try {
      await apiPost(`/api/admin/expenses/${id}/delete`);
      toast.success("Dépense supprimée");
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Supprimer" disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4 text-destructive" />}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer cette dépense ?</AlertDialogTitle>
          <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={del}>Supprimer</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function ExpensesView({
  items,
  total,
  options,
  tableMissing,
}: {
  items: ExpenseItem[];
  total: number;
  options: Options;
  tableMissing: boolean;
}) {
  const [category, setCategory] = useState<string>("all");

  const filtered = useMemo(
    () => (category === "all" ? items : items.filter((e) => e.category === category)),
    [items, category],
  );
  const filteredTotal = useMemo(() => filtered.reduce((s, e) => s + e.amount_mru, 0), [filtered]);

  const columns: ColumnDef<ExpenseItem>[] = [
    { accessorKey: "expense_date", header: "Date", cell: ({ row }) => formatDate(row.original.expense_date) },
    { accessorKey: "category", header: "Catégorie", cell: ({ row }) => CATEGORY_LABEL[row.original.category] ?? row.original.category },
    { accessorKey: "amount_mru", header: "Montant", cell: ({ row }) => <span className="font-medium">{formatMru(row.original.amount_mru)}</span> },
    { accessorKey: "description", header: "Description", cell: ({ row }) => row.original.description ?? "—" },
    { id: "vehicle", header: "Véhicule", cell: ({ row }) => row.original.vehicle_label ?? "—" },
    { id: "driver", header: "Collecteur", cell: ({ row }) => row.original.driver_name ?? "—" },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <ExpenseDialog
            expense={row.original}
            options={options}
            trigger={<Button variant="ghost" size="icon" aria-label="Éditer"><Pencil className="size-4" /></Button>}
          />
          <DeleteButton id={row.original.id} />
        </div>
      ),
    },
  ];

  if (tableMissing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Table « expenses » absente</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Applique la migration <code>supabase/migrations/20260607_expenses.sql</code> dans l&apos;éditeur
          SQL Supabase, puis recharge cette page.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total (toutes dépenses)</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatMru(total)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total filtré</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatMru(filteredTotal)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Nombre</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{filtered.length}</div></CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {Object.entries(CATEGORY_LABEL).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ExpenseDialog
          options={options}
          trigger={<Button><Plus className="mr-2 size-4" /> Nouvelle dépense</Button>}
        />
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage="Aucune dépense." />
    </div>
  );
}
