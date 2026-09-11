"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiPost } from "@/lib/admin-client";
import type { VehicleItem } from "@/core/actions/admin/fleet";

export function VehicleDialog({
  trigger,
  vehicle,
  drivers,
}: {
  trigger: ReactNode;
  vehicle?: VehicleItem;
  drivers: { id: number; name: string }[];
}) {
  const router = useRouter();
  const editing = Boolean(vehicle);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    license_plate: vehicle?.license_plate ?? "",
    type: vehicle?.type ?? "",
    assigned_driver_id: vehicle?.assigned_driver_id ? String(vehicle.assigned_driver_id) : "",
  });

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        license_plate: form.license_plate.trim(),
        type: form.type.trim() || undefined,
        assigned_driver_id: form.assigned_driver_id ? Number(form.assigned_driver_id) : null,
      };
      if (editing) {
        await apiPost(`/api/admin/vehicles/${vehicle!.id}`, payload);
        toast.success("Véhicule mis à jour");
      } else {
        await apiPost("/api/admin/vehicles", payload);
        toast.success("Véhicule ajouté");
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Modifier le véhicule" : "Nouveau véhicule"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="plate">Immatriculation *</Label>
              <Input
                id="plate"
                value={form.license_plate}
                onChange={(e) => set("license_plate", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="type">Type</Label>
              <Input
                id="type"
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
                placeholder="camion, tricycle…"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Collecteur assigné</Label>
              <Select value={form.assigned_driver_id} onValueChange={(v) => set("assigned_driver_id", v)}>
                <SelectTrigger><SelectValue placeholder="Aucun" /></SelectTrigger>
                <SelectContent>
                  {drivers.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
