import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarShell } from "@/components/admin/sidebar-shell";
import { Topbar } from "@/components/admin/topbar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full bg-muted/30">
        <SidebarShell />

        {/* Contenu */}
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>

        <Toaster richColors position="top-right" />
      </div>
    </TooltipProvider>
  );
}
