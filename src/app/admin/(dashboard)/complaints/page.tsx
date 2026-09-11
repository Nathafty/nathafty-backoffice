import { PageHeader } from "@/components/admin/page-header";
import { ComplaintsTable } from "@/components/admin/complaints/complaints-table";
import { listComplaints } from "@/core/actions/admin/complaints";

export const dynamic = "force-dynamic";

export default async function ComplaintsPage() {
  const complaints = await listComplaints();
  const openCount = complaints.filter((c) => c.status === "open" || c.status === "in_progress").length;
  return (
    <div className="space-y-6">
      <PageHeader
        title="Réclamations"
        description={
          openCount > 0
            ? `${openCount} réclamation${openCount > 1 ? "s" : ""} à traiter.`
            : "Toutes les réclamations sont traitées."
        }
      />
      <ComplaintsTable data={complaints} />
    </div>
  );
}
