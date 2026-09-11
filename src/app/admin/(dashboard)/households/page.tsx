import { PageHeader } from "@/components/admin/page-header";
import { HouseholdsView } from "@/components/admin/households/households-view";
import { listHouseholds } from "@/core/actions/admin/households";
import { listDistricts } from "@/core/actions/admin/fleet";

export const dynamic = "force-dynamic";

export default async function HouseholdsPage() {
  const [households, districts] = await Promise.all([listHouseholds(), listDistricts()]);
  return (
    <div className="space-y-6">
      <PageHeader title="Ménages" description="Inscriptions à valider et ménages actifs." />
      <HouseholdsView households={households} districts={districts} />
    </div>
  );
}
