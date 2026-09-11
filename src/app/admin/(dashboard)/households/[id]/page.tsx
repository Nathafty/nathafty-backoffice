import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { EmptyState } from "@/components/admin/empty-state";
import { HouseholdValidateAction } from "@/components/admin/households/household-validate-action";
import { CATEGORY_LABEL } from "@/components/admin/complaints/category-label";
import { formatDate } from "@/lib/format";
import { getHouseholdDetail } from "@/core/actions/admin/households";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  MAISON: "Maison",
  ETABLISSEMENT: "Établissement",
};

export default async function HouseholdDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getHouseholdDetail(id);
  if (!detail) notFound();
  const { household, complaints } = detail as unknown as {
    household: {
      id: string;
      name: string;
      phone: string | null;
      type: string;
      address: string | null;
      address_details: string | null;
      whatsapp: string | null;
      district_id: number | null;
      family_size: number | null;
      subscription_type: string | null;
      status: string | null;
      actif_remaining_days: number;
      registration_date: string | null;
    };
    complaints: {
      id: string;
      ticket_number: string;
      category: string;
      status: string | null;
      description: string | null;
      created_at: string | null;
    }[];
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={household.name}
        description={`Ménage #${household.id}`}
        actions={household.status === "PENDING" ? <HouseholdValidateAction id={household.id} /> : undefined}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Informations</CardTitle>
          <StatusBadge status={household.status} />
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <div><span className="text-muted-foreground">Type : </span>{TYPE_LABEL[household.type] ?? household.type}</div>
          <div><span className="text-muted-foreground">Téléphone : </span>{household.phone ?? "—"}</div>
          <div><span className="text-muted-foreground">WhatsApp : </span>{household.whatsapp ?? "—"}</div>
          <div><span className="text-muted-foreground">Taille du foyer : </span>{household.family_size ?? "—"}</div>
          <div><span className="text-muted-foreground">Adresse : </span>{household.address ?? "—"}</div>
          <div><span className="text-muted-foreground">Précisions : </span>{household.address_details ?? "—"}</div>
          <div><span className="text-muted-foreground">Quartier (id) : </span>{household.district_id ?? "—"}</div>
          <div><span className="text-muted-foreground">Formule : </span>{household.subscription_type ?? "—"}</div>
          <div><span className="text-muted-foreground">Jours restants : </span>{household.actif_remaining_days}</div>
          <div><span className="text-muted-foreground">Inscrit le : </span>{formatDate(household.registration_date)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Réclamations</CardTitle>
        </CardHeader>
        <CardContent>
          {complaints.length === 0 ? (
            <EmptyState title="Aucune réclamation" description="Ce ménage n'a soumis aucune réclamation." />
          ) : (
            <div className="space-y-2">
              {complaints.map((c) => (
                <Link
                  key={c.id}
                  href={`/admin/complaints/${c.id}`}
                  className="flex items-center justify-between gap-2 rounded-md border p-3 text-sm hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{c.ticket_number}</p>
                    <p className="truncate text-muted-foreground">{CATEGORY_LABEL[c.category] ?? c.category}</p>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span>{formatDate(c.created_at)}</span>
                    <StatusBadge status={c.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
