import { PageHeader } from "@/components/admin/page-header";
import { FleetView } from "@/components/admin/fleet/fleet-view";
import { listVehicles, listDistricts, listDriversLite } from "@/core/actions/admin/fleet";

export const dynamic = "force-dynamic";

export default async function FleetPage() {
  const [vehicles, districts, drivers] = await Promise.all([
    listVehicles(),
    listDistricts(),
    listDriversLite(),
  ]);
  return (
    <div className="space-y-6">
      <PageHeader title="Véhicules & Districts" description="Parc de véhicules et secteurs de collecte." />
      <FleetView vehicles={vehicles} districts={districts} drivers={drivers} />
    </div>
  );
}
