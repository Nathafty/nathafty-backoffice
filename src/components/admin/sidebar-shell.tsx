"use client";

import { useState } from "react";
import { ChevronsLeft, ChevronsRight, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "./sidebar-nav";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "nathafty-admin-sidebar-collapsed";

function readStoredCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

/** Sidebar desktop (≥ lg) : repliable en icônes seules, état persisté en localStorage. */
export function SidebarShell() {
  // Lecture synchrone (lazy initializer) plutôt qu'un useEffect + setState, qui provoquerait un rendu en cascade.
  const [collapsed, setCollapsed] = useState(readStoredCollapsed);

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <aside
      suppressHydrationWarning
      className={cn(
        "hidden shrink-0 flex-col border-r bg-sidebar transition-[width] duration-150 lg:flex",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b px-4 text-base font-semibold text-sidebar-foreground">
        <Leaf className="size-5 shrink-0 text-emerald-600" aria-hidden />
        {!collapsed && <span>Nathafty</span>}
      </div>
      <div className="flex-1 overflow-y-auto">
        <SidebarNav collapsed={collapsed} />
      </div>
      <div className={cn("flex items-center border-t p-2", collapsed ? "justify-center" : "justify-between px-3")}>
        {!collapsed && <p className="text-xs text-muted-foreground">Backoffice admin</p>}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label={collapsed ? "Déplier la navigation" : "Replier la navigation"}
          className="focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
        </Button>
      </div>
    </aside>
  );
}
