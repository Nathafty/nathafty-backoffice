"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { apiPost } from "@/lib/admin-client";

export function PaymentStatusAction({ id, status }: { id: number; status: string | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function setStatus(next: "paid" | "rejected") {
    setBusy(true);
    try {
      await apiPost(`/api/admin/payments/${id}/status`, { status: next });
      toast.success(next === "paid" ? "Paiement confirmé" : "Paiement rejeté");
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (status !== "pending") return null;

  return (
    <div className="flex gap-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="mr-1 size-4" />} Confirmer
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer ce paiement ?</AlertDialogTitle>
            <AlertDialogDescription>Le paiement passera au statut « Payé ».</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => setStatus("paid")}>Confirmer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="outline" disabled={busy}>
            <X className="mr-1 size-4" /> Rejeter
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rejeter ce paiement ?</AlertDialogTitle>
            <AlertDialogDescription>Le paiement passera au statut « Rejeté ».</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => setStatus("rejected")}>Rejeter</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
