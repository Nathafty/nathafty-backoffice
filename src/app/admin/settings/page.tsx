import { Settings } from "lucide-react";
import { ComingSoon } from "@/components/admin/coming-soon";

export default function SettingsPage() {
  return (
    <ComingSoon
      title="Paramètres"
      description="Configuration du compte et de l'application."
      icon={Settings}
    />
  );
}
