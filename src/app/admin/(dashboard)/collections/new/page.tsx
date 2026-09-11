import { PageHeader } from "@/components/admin/page-header";
import { CollectionForm } from "@/components/admin/collections/collection-form";
import { planningOptions } from "@/core/actions/admin/collections";

export const dynamic = "force-dynamic";

export default async function NewCollectionPage() {
  const { drivers, households } = await planningOptions();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Nouvelle collecte" description="Planifier une tournée et sélectionner les ménages." />
      <CollectionForm drivers={drivers} households={households} />
    </div>
  );
}
