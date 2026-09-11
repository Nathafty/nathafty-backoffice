import { CreditCard } from "lucide-react";
import { ComingSoon } from "@/components/admin/coming-soon";

export default function PaymentsPage() {
  return (
    <ComingSoon
      title="Paiements"
      description="Historique et suivi des paiements des ménages."
      icon={CreditCard}
    />
  );
}
