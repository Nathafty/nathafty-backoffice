import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { DriversTable } from "@/components/admin/drivers/drivers-table";
import { DriverDialog } from "@/components/admin/drivers/driver-dialog";
import { listDrivers } from "@/core/actions/admin/drivers";

export const dynamic = "force-dynamic";

export default async function DriversPage() {
  const data = await listDrivers();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Collecteurs"
        description="Gestion des collecteurs : comptes, activation, suivi."
        actions={
          <DriverDialog
            trigger={
              <Button>
                <Plus className="mr-2 size-4" /> Nouveau collecteur
              </Button>
            }
          />
        }
      />
      <DriversTable data={data} />
    </div>
  );
}
