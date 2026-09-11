"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
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

export function HouseholdValidateAction({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function validate() {
    setBusy(true);
    try {
      await apiPost(`/api/admin/households/${id}/validate`);
      toast.success("Ménage validé");
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
        <Button size="sm" disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="mr-1 size-4" />} Valider
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Valider ce ménage ?</AlertDialogTitle>
          <AlertDialogDescription>
            Le ménage passera au statut VALID et pourra être planifié pour une collecte.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={validate}>Valider</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
