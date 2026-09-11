import { PageHeader } from "@/components/admin/page-header";
import { PaymentsView } from "@/components/admin/payments/payments-view";
import { listPayments } from "@/core/actions/admin/payments";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const payments = await listPayments();
  return (
    <div className="space-y-6">
      <PageHeader title="Paiements" description="Historique et suivi des paiements des ménages." />
      <PaymentsView payments={payments} />
    </div>
  );
}
