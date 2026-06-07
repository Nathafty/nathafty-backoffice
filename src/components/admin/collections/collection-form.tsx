"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiPost } from "@/lib/admin-client";

interface DriverLite {
  id: number;
  name: string;
  status: string | null;
}
interface HouseholdLite {
  id: string;
  name: string;
  address: string | null;
}

export interface CollectionFormProps {
  drivers: DriverLite[];
  households: HouseholdLite[];
  /** Édition : id existant + valeurs initiales. */
  collectionId?: number;
  initial?: {
    title: string;
    zone: string | null;
    scheduled_date: string | null;
    end_date: string | null;
    driver_id: number | null;
    household_ids: string[];
  };
}

export function CollectionForm({ drivers, households, collectionId, initial }: CollectionFormProps) {
  const router = useRouter();
  const editing = Boolean(collectionId);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [zone, setZone] = useState(initial?.zone ?? "");
  const [scheduledDate, setScheduledDate] = useState(initial?.scheduled_date ?? "");
  const [endDate, setEndDate] = useState(initial?.end_date ?? "");
  const [driverId, setDriverId] = useState<string>(initial?.driver_id ? String(initial.driver_id) : "");
  const [selected, setSelected] = useState<Set<string>>(new Set(initial?.household_ids ?? []));
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(
    () => households.filter((h) => `${h.name} ${h.address ?? ""}`.toLowerCase().includes(search.toLowerCase())),
    [households, search],
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !scheduledDate) {
      toast.error("Titre et date prévue sont requis");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        title: title.trim(),
        zone: zone.trim() || undefined,
        scheduled_date: scheduledDate,
        end_date: endDate || undefined,
        driver_id: driverId ? Number(driverId) : undefined,
        household_ids: Array.from(selected),
      };
      if (editing) {
        await apiPost(`/api/admin/collections/${collectionId}`, payload);
        toast.success("Collecte mise à jour");
      } else {
        await apiPost("/api/admin/collections", payload);
        toast.success("Collecte planifiée");
      }
      router.push("/admin/collections");
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="title">Titre *</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tournée Tevragh Zeina" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="zone">Zone</Label>
          <Input id="zone" value={zone} onChange={(e) => setZone(e.target.value)} placeholder="Tevragh Zeina" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="scheduled">Date prévue *</Label>
          <Input id="scheduled" type="date" value={scheduledDate ?? ""} onChange={(e) => setScheduledDate(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="end">Date de fin</Label>
          <Input id="end" type="date" value={endDate ?? ""} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Collecteur</Label>
          <Select value={driverId} onValueChange={setDriverId}>
            <SelectTrigger>
              <SelectValue placeholder="Aucun (à assigner)" />
            </SelectTrigger>
            <SelectContent>
              {drivers.map((d) => (
                <SelectItem key={d.id} value={String(d.id)}>
                  {d.name} {d.status && d.status !== "ACTIVE" ? `(${d.status})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Ménages à inclure ({selected.size} sélectionné{selected.size > 1 ? "s" : ""})</Label>
        </div>
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un ménage…" />
        <div className="max-h-72 space-y-1 overflow-y-auto rounded-md border p-2">
          {filtered.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">Aucun ménage éligible (VALID).</p>
          ) : (
            filtered.map((h) => (
              <label
                key={h.id}
                className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-accent"
              >
                <input
                  type="checkbox"
                  className="size-4 accent-emerald-600"
                  checked={selected.has(h.id)}
                  onChange={() => toggle(h.id)}
                />
                <span className="flex-1">
                  <span className="font-medium">{h.name}</span>
                  {h.address && <span className="ml-2 text-xs text-muted-foreground">{h.address}</span>}
                </span>
                <span className="text-xs text-muted-foreground">{h.id}</span>
              </label>
            ))
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={busy}>
          Annuler
        </Button>
        <Button type="submit" disabled={busy}>
          {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
          {editing ? "Enregistrer" : "Planifier la collecte"}
        </Button>
      </div>
    </form>
  );
}
