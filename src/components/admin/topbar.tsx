"use client";

import { useState } from "react";
import { Menu, Leaf } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "./sidebar-nav";

/** Barre supérieure : déclencheur du menu mobile + titre de page. */
export function Topbar({ title }: { title?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Ouvrir le menu"
          >
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="flex items-center gap-2 border-b px-4 py-3 text-base font-semibold">
            <Leaf className="size-5 text-emerald-600" /> Nathafty
          </SheetTitle>
          <SidebarNav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <h1 className="text-sm font-semibold text-foreground">{title ?? "Administration"}</h1>
    </header>
  );
}
