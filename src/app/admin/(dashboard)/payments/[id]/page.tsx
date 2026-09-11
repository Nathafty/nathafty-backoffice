import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { PaymentStatusAction } from "@/components/admin/payments/payment-status-action";
import { formatDate, formatMru } from "@/lib/format";
import { getPaymentDetail } from "@/core/actions/admin/payments";

export const dynamic = "force-dynamic";

export default async function PaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) notFound();
  const detail = await getPaymentDetail(numericId);
  if (!detail) notFound();
  const { payment, subscription } = detail as unknown as {
    payment: {
      id: number;
      household_id: string | null;
      household_name: string | null;
      household_phone: string | null;
      amount: number;
      due_date: string;
      paid_date: string | null;
      status: string | null;
      payment_method: string | null;
      subscription_type: string | null;
    };
    subscription: {
      id: number;
      plan_id: number;
      start_date: string;
      end_date: string;
      status: string;
      subscription_plans: { name: string; price_mru: number } | null;
    } | null;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Paiement #${payment.id}`}
        description={payment.household_name ?? undefined}
        actions={<PaymentStatusAction id={payment.id} status={payment.status} />}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Détail</CardTitle>
          <StatusBadge status={payment.status} />
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <span className="text-muted-foreground">Ménage : </span>
            {payment.household_id ? (
              <Link href={`/admin/households/${payment.household_id}`} className="hover:underline">
                {payment.household_name ?? payment.household_id}
              </Link>
            ) : (
              "—"
            )}
          </div>
          <div><span className="text-muted-foreground">Téléphone : </span>{payment.household_phone ?? "—"}</div>
          <div><span className="text-muted-foreground">Montant : </span>{formatMru(payment.amount)}</div>
          <div><span className="text-muted-foreground">Méthode : </span>{payment.payment_method ?? "—"}</div>
          <div><span className="text-muted-foreground">Échéance : </span>{formatDate(payment.due_date)}</div>
          <div><span className="text-muted-foreground">Payé le : </span>{formatDate(payment.paid_date)}</div>
          <div><span className="text-muted-foreground">Formule : </span>{payment.subscription_type ?? "—"}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Abonnement associé</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {subscription ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <div><span className="text-muted-foreground">Plan : </span>{subscription.subscription_plans?.name ?? "—"}</div>
              <div><span className="text-muted-foreground">Prix : </span>{formatMru(subscription.subscription_plans?.price_mru)}</div>
              <div><span className="text-muted-foreground">Période : </span>{formatDate(subscription.start_date)} → {formatDate(subscription.end_date)}</div>
              <div><span className="text-muted-foreground">Statut : </span><StatusBadge status={subscription.status} /></div>
            </div>
          ) : (
            <p className="text-muted-foreground">Aucun abonnement lié à ce paiement.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
