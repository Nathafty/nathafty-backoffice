import { MessageCircleWarning } from "lucide-react";
import { ComingSoon } from "@/components/admin/coming-soon";

export default function ComplaintsPage() {
  return (
    <ComingSoon
      title="Réclamations"
      description="Suivi et réponse aux réclamations des ménages."
      icon={MessageCircleWarning}
    />
  );
}
