"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Power } from "lucide-react";
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

/** Active/désactive une ressource (véhicule ou district) — pas de DELETE réel. */
export function ToggleActiveButton({
  path,
  isActive,
  label,
}: {
  path: string;
  isActive: boolean;
  label: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      await apiPost(path, { is_active: !isActive });
      toast.success(isActive ? "Désactivé" : "Réactivé");
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
        <Button variant="ghost" size="icon" aria-label={isActive ? "Désactiver" : "Réactiver"} disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Power className={isActive ? "size-4 text-destructive" : "size-4 text-emerald-600"} />}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{isActive ? `Désactiver ${label} ?` : `Réactiver ${label} ?`}</AlertDialogTitle>
          <AlertDialogDescription>
            {isActive
              ? "L'élément désactivé n'apparaîtra plus dans les sélections actives, sans perte de données."
              : "L'élément redevient disponible dans les sélections."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={toggle}>{isActive ? "Désactiver" : "Réactiver"}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
