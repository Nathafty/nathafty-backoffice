import type { LucideIcon } from "lucide-react";
import { Construction } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent } from "@/components/ui/card";

/** Page de section pas encore implémentée — visible dans la nav, contenu à venir. */
export function ComingSoon({
  title,
  description,
  icon: Icon = Construction,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Icon className="size-6 text-muted-foreground" aria-hidden />
          </div>
          <p className="font-medium text-foreground">Bientôt disponible</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Cette section est en cours de construction et sera disponible dans une prochaine mise à jour.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
