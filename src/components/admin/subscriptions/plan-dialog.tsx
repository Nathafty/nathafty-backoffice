"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import type { PlanRow } from "@/core/repositories/subscriptionPlanRepo";

export function PlanDialog({ plan }: { plan?: PlanRow }) {
  const router = useRouter();
  const editing = Boolean(plan);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    code: plan?.code ?? "",
    name: plan?.name ?? "",
    description: plan?.description ?? "",
    price_mru: plan?.price_mru?.toString() ?? "",
    duration_days: plan?.duration_days?.toString() ?? "30",
    collections_per_week: plan?.collections_per_week?.toString() ?? "1",
    is_active: plan?.is_active ?? true,
  });

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const base = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price_mru: Number(form.price_mru),
        duration_days: Number(form.duration_days),
        collections_per_week: Number(form.collections_per_week),
        is_active: form.is_active,
      };
      if (editing) {
        await apiPost(`/api/admin/subscription-plans/${plan!.id}`, base);
        toast.success("Plan mis à jour");
      } else {
        await apiPost("/api/admin/subscription-plans", { ...base, code: form.code.trim() });
        toast.success("Plan créé");
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
      <DialogTrigger asChild>
        {editing ? (
          <Button variant="ghost" size="icon" aria-label="Éditer le plan">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="mr-2 size-4" /> Nouveau plan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Modifier le plan" : "Nouveau plan"}</DialogTitle>
          <DialogDescription>Catalogue des abonnements (prix en MRU, durée en jours).</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {!editing && (
            <div className="space-y-1.5">
              <Label htmlFor="code">Code *</Label>
              <Input id="code" value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="basic" required />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="name">Nom *</Label>
            <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="desc">Description</Label>
            <Textarea id="desc" value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="price">Prix (MRU) *</Label>
              <Input id="price" type="number" min="0" value={form.price_mru} onChange={(e) => set("price_mru", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dur">Durée (j) *</Label>
              <Input id="dur" type="number" min="1" value={form.duration_days} onChange={(e) => set("duration_days", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cpw">Collectes/sem. *</Label>
              <Input id="cpw" type="number" min="1" value={form.collections_per_week} onChange={(e) => set("collections_per_week", e.target.value)} required />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="size-4 accent-emerald-600" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} />
            Plan actif
          </label>
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
