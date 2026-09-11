import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { ComplaintRespondForm } from "@/components/admin/complaints/complaint-respond-form";
import { CATEGORY_LABEL } from "@/components/admin/complaints/category-label";
import { formatDate } from "@/lib/format";
import { getComplaintDetail } from "@/core/actions/admin/complaints";

export const dynamic = "force-dynamic";

export default async function ComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const complaint = await getComplaintDetail(id);
  if (!complaint) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={complaint.ticket_number}
        description={
          complaint.household_id ? (
            <>
              Ménage :{" "}
              <Link href={`/admin/households/${complaint.household_id}`} className="hover:underline">
                {complaint.household_name ?? complaint.household_id}
              </Link>
            </>
          ) : (
            "Ménage inconnu"
          )
        }
        actions={<StatusBadge status={complaint.status} />}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Détail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid gap-2 sm:grid-cols-2">
            <div><span className="text-muted-foreground">Catégorie : </span>{CATEGORY_LABEL[complaint.category] ?? complaint.category}</div>
            <div><span className="text-muted-foreground">Priorité : </span><StatusBadge status={complaint.priority} /></div>
            <div><span className="text-muted-foreground">Téléphone : </span>{complaint.households?.phone ?? "—"}</div>
            <div><span className="text-muted-foreground">Reçue le : </span>{formatDate(complaint.submitted_date)}</div>
            {complaint.resolved_date && (
              <div><span className="text-muted-foreground">Résolue le : </span>{formatDate(complaint.resolved_date)}</div>
            )}
          </div>
          <div>
            <p className="text-muted-foreground">Description</p>
            <p className="mt-1 whitespace-pre-wrap">{complaint.description ?? "—"}</p>
          </div>
          {complaint.complaint_attachments.length > 0 && (
            <div>
              <p className="text-muted-foreground">Pièces jointes</p>
              <ul className="mt-1 list-inside list-disc">
                {complaint.complaint_attachments.map((a) => (
                  <li key={a.id}>
                    <a href={a.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {a.file_url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Traitement</CardTitle>
        </CardHeader>
        <CardContent>
          <ComplaintRespondForm complaint={complaint} />
        </CardContent>
      </Card>
    </div>
  );
}
