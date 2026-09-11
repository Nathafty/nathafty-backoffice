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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiPost } from "@/lib/admin-client";
import type { DistrictRow } from "@/core/repositories/districtRepo";

export function DistrictDialog({
  trigger,
  district,
}: {
  trigger: ReactNode;
  district?: DistrictRow;
}) {
  const router = useRouter();
  const editing = Boolean(district);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: district?.name ?? "",
    code: district?.code ?? "",
    description: district?.description ?? "",
  });

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim() || undefined,
        description: form.description.trim() || undefined,
      };
      if (editing) {
        await apiPost(`/api/admin/districts/${district!.id}`, payload);
        toast.success("District mis à jour");
      } else {
        await apiPost("/api/admin/districts", payload);
        toast.success("District ajouté");
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
          <DialogTitle>{editing ? "Modifier le district" : "Nouveau district"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="dname">Nom *</Label>
              <Input id="dname" value={form.name} onChange={(e) => set("name", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dcode">Code</Label>
              <Input id="dcode" value={form.code} onChange={(e) => set("code", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ddesc">Description</Label>
            <Textarea id="ddesc" value={form.description} onChange={(e) => set("description", e.target.value)} />
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
