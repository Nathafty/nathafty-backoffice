"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiPost } from "@/lib/admin-client";
import type { ExpenseItem } from "@/core/actions/admin/expenses";

const CATEGORIES = [
  { value: "carburant", label: "Carburant" },
  { value: "salaire", label: "Salaire" },
  { value: "maintenance", label: "Maintenance" },
  { value: "autre", label: "Autre" },
];

interface Lite {
  vehicles: { id: number; license_plate: string }[];
  drivers: { id: number; name: string }[];
}

export function ExpenseDialog({
  trigger,
  expense,
  options,
}: {
  trigger: ReactNode;
  expense?: ExpenseItem;
  options: Lite;
}) {
  const router = useRouter();
  const editing = Boolean(expense);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    category: expense?.category ?? "carburant",
    amount_mru: expense?.amount_mru?.toString() ?? "",
    expense_date: expense?.expense_date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    description: expense?.description ?? "",
    vehicle_id: expense?.vehicle_id ? String(expense.vehicle_id) : "",
    driver_id: expense?.driver_id ? String(expense.driver_id) : "",
    payment_method: expense?.payment_method ?? "",
  });

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        category: form.category,
        amount_mru: Number(form.amount_mru),
        expense_date: form.expense_date,
        description: form.description.trim() || undefined,
        vehicle_id: form.vehicle_id ? Number(form.vehicle_id) : null,
        driver_id: form.driver_id ? Number(form.driver_id) : null,
        payment_method: form.payment_method.trim() || undefined,
      };
      if (editing) {
        await apiPost(`/api/admin/expenses/${expense!.id}`, payload);
        toast.success("Dépense mise à jour");
      } else {
        await apiPost("/api/admin/expenses", payload);
        toast.success("Dépense enregistrée");
      }
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Modifier la dépense" : "Nouvelle dépense"}</DialogTitle>
          <DialogDescription>Montant en MRU.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Catégorie *</Label>
              <Select value={form.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="amount">Montant (MRU) *</Label>
              <Input id="amount" type="number" min="0" step="0.01" value={form.amount_mru} onChange={(e) => set("amount_mru", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edate">Date *</Label>
              <Input id="edate" type="date" value={form.expense_date} onChange={(e) => set("expense_date", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pm">Moyen de paiement</Label>
              <Input id="pm" value={form.payment_method} onChange={(e) => set("payment_method", e.target.value)} placeholder="cash, bankily…" />
            </div>
            <div className="space-y-1.5">
              <Label>Véhicule</Label>
              <Select value={form.vehicle_id} onValueChange={(v) => set("vehicle_id", v)}>
                <SelectTrigger><SelectValue placeholder="Aucun" /></SelectTrigger>
                <SelectContent>
                  {options.vehicles.map((v) => (
                    <SelectItem key={v.id} value={String(v.id)}>{v.license_plate}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Collecteur</Label>
              <Select value={form.driver_id} onValueChange={(v) => set("driver_id", v)}>
                <SelectTrigger><SelectValue placeholder="Aucun" /></SelectTrigger>
                <SelectContent>
                  {options.drivers.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="desc">Description</Label>
            <Textarea id="desc" value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="mr-2 size-4 animate-spin" />} Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
