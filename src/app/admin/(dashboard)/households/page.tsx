import { Home } from "lucide-react";
import { ComingSoon } from "@/components/admin/coming-soon";

export default function HouseholdsPage() {
  return (
    <ComingSoon
      title="Ménages"
      description="Liste, détail et validation des ménages inscrits."
      icon={Home}
    />
  );
}
