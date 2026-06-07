import type { ReactNode } from "react";
import { Leaf } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { SidebarNav } from "@/components/admin/sidebar-nav";
import { Topbar } from "@/components/admin/topbar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-muted/30">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-sidebar md:flex">
        <div className="flex h-14 items-center gap-2 border-b px-4 text-base font-semibold text-sidebar-foreground">
          <Leaf className="size-5 text-emerald-600" aria-hidden />
          <span>Nathafty</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarNav />
        </div>
        <p className="border-t p-3 text-xs text-muted-foreground">Backoffice admin</p>
      </aside>

      {/* Contenu */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>

      <Toaster richColors position="top-right" />
    </div>
  );
}
