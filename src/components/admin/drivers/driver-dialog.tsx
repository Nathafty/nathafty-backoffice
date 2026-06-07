"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { DriverRow } from "@/core/repositories/driverRepo";

export function DriverDialog({ driver, trigger }: { driver?: DriverRow; trigger: ReactNode }) {
  const router = useRouter();
  const editing = Boolean(driver);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: driver?.name ?? "",
    email: "",
    password: "",
    phone: driver?.phone ?? "",
    nni: driver?.nni ?? "",
  });

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (editing) {
        await apiPost(`/api/admin/drivers/${driver!.id}`, {
          name: form.name.trim(),
          phone: form.phone.trim() || null,
          nni: form.nni.trim() || null,
        });
        toast.success("Collecteur mis à jour");
      } else {
        await apiPost("/api/admin/drivers", {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim() || undefined,
          nni: form.nni.trim() || undefined,
        });
        toast.success("Collecteur créé (compte Auth inclus)");
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
          <DialogTitle>{editing ? "Modifier le collecteur" : "Nouveau collecteur"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Mettre à jour les informations du collecteur."
              : "Crée le compte de connexion (email/mot de passe) et la fiche collecteur."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="d-name">Nom *</Label>
            <Input id="d-name" value={form.name} onChange={(e) => set("name", e.target.value)} required />
          </div>
          {!editing && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="d-email">Email de connexion *</Label>
                <Input id="d-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="d-pwd">Mot de passe *</Label>
                <Input id="d-pwd" type="text" value={form.password} onChange={(e) => set("password", e.target.value)} minLength={6} required />
              </div>
            </>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="d-phone">Téléphone</Label>
              <Input id="d-phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="d-nni">NNI</Label>
              <Input id="d-nni" value={form.nni} onChange={(e) => set("nni", e.target.value)} />
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
