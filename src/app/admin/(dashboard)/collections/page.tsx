import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { CollectionsTable } from "@/components/admin/collections/collections-table";
import { listCollections } from "@/core/actions/admin/collections";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const data = await listCollections();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Collectes"
        description="Planification et suivi des tournées de collecte."
        actions={
          <Button asChild>
            <Link href="/admin/collections/new">
              <Plus className="mr-2 size-4" /> Nouvelle collecte
            </Link>
          </Button>
        }
      />
      <CollectionsTable data={data} />
    </div>
  );
}
