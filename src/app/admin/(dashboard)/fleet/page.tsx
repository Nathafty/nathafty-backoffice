import { MapPinned } from "lucide-react";
import { ComingSoon } from "@/components/admin/coming-soon";

export default function FleetPage() {
  return (
    <ComingSoon
      title="Véhicules & Districts"
      description="Gestion du parc de véhicules et des secteurs de collecte."
      icon={MapPinned}
    />
  );
}
