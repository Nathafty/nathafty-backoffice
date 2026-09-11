"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiPost } from "@/lib/admin-client";
import type { ComplaintDetail } from "@/core/repositories/complaintRepo";

const STATUS_OPTIONS = [
  { value: "open", label: "Ouverte" },
  { value: "in_progress", label: "En cours" },
  { value: "resolved", label: "Résolue" },
  { value: "closed", label: "Fermée" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Faible" },
  { value: "medium", label: "Moyenne" },
  { value: "high", label: "Haute" },
];

export function ComplaintRespondForm({ complaint }: { complaint: ComplaintDetail }) {
  const router = useRouter();
  const [status, setStatus] = useState(complaint.status ?? "open");
  const [priority, setPriority] = useState(complaint.priority ?? "medium");
  const [response, setResponse] = useState(complaint.response ?? "");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await apiPost(`/api/admin/complaints/${complaint.id}/respond`, {
        status,
        priority,
        ...(response.trim() ? { response: response.trim() } : {}),
      });
      toast.success("Réclamation mise à jour");
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Statut</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Priorité</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="response">Réponse au ménage</Label>
        <Textarea
          id="response"
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Réponse visible par le ménage dans son espace client…"
          rows={4}
        />
      </div>
      <Button type="submit" disabled={busy}>
        {busy && <Loader2 className="mr-2 size-4 animate-spin" />} Enregistrer
      </Button>
    </form>
  );
}
