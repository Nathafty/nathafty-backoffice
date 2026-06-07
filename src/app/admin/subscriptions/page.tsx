import { PageHeader } from "@/components/admin/page-header";
import { SubscriptionsView } from "@/components/admin/subscriptions/subscriptions-view";
import {
  listPlans,
  listRenewalRequests,
  listSubscriptions,
} from "@/core/actions/admin/subscriptions";

export const dynamic = "force-dynamic";

export default async function SubscriptionsPage() {
  const [renewals, subscriptions, plans] = await Promise.all([
    listRenewalRequests(),
    listSubscriptions(),
    listPlans(),
  ]);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Abonnements"
        description="Renouvellements à traiter, abonnements actifs et catalogue de plans."
      />
      <SubscriptionsView renewals={renewals} subscriptions={subscriptions} plans={plans} />
    </div>
  );
}
