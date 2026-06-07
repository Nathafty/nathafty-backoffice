import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Variant = "neutral" | "info" | "success" | "warning" | "danger";

const STYLES: Record<Variant, string> = {
  neutral: "bg-muted text-muted-foreground",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  danger: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

/** Mappe les statuts métier (collecte, ménage, driver, paiement…) vers un libellé + couleur. */
const MAP: Record<string, { label: string; variant: Variant }> = {
  // collection_status
  SCHEDULED: { label: "Planifiée", variant: "info" },
  PROGRESS: { label: "En cours", variant: "warning" },
  COMPLETE: { label: "Terminée", variant: "success" },
  // house_hold_status
  PENDING: { label: "En attente", variant: "warning" },
  VALID: { label: "Validé", variant: "success" },
  // driver_status
  ACTIVE: { label: "Actif", variant: "success" },
  INACTIVE: { label: "Inactif", variant: "neutral" },
  SUSPENDED: { label: "Suspendu", variant: "danger" },
  // houses_to_collect / generic
  pending: { label: "En attente", variant: "warning" },
  done: { label: "Collectée", variant: "success" },
  skipped: { label: "Non collectée", variant: "danger" },
  // renewal / subscription / payment
  active: { label: "Actif", variant: "success" },
  processed: { label: "Traité", variant: "success" },
  approved: { label: "Approuvé", variant: "success" },
  rejected: { label: "Rejeté", variant: "danger" },
  paid: { label: "Payé", variant: "success" },
  overdue: { label: "En retard", variant: "danger" },
  expired: { label: "Expiré", variant: "neutral" },
};

export function StatusBadge({ status }: { status: string | null | undefined }) {
  if (!status) return <span className="text-muted-foreground">—</span>;
  const entry = MAP[status] ?? { label: status, variant: "neutral" as const };
  return (
    <Badge variant="secondary" className={cn("font-medium", STYLES[entry.variant])}>
      {entry.label}
    </Badge>
  );
}
