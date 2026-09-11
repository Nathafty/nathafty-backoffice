import { Skeleton } from "@/components/ui/skeleton";

/** Silhouette de page admin (PageHeader + tableau) affichée pendant le chargement serveur (`loading.tsx`). */
export function PageSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-9 w-full max-w-sm" />
      <div className="space-y-2 rounded-md border p-4">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}
