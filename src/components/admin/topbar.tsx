"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, ChevronRight } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "./sidebar-nav";
import { NAV_ITEMS } from "./nav-items";
import { Logo } from "./logo";

interface Crumb {
  label: string;
  href?: string;
}

/** Dérive un fil d'Ariane depuis le pathname courant + NAV_ITEMS (pages de détail/création → 2e segment générique). */
function getBreadcrumb(pathname: string): Crumb[] {
  const item = NAV_ITEMS.find((i) => pathname === i.href || pathname.startsWith(`${i.href}/`));
  if (!item) return [{ label: "Administration" }];
  if (pathname === item.href) return [{ label: item.label }];
  const rest = pathname.slice(item.href.length + 1);
  return [{ label: item.label, href: item.href }, { label: rest.startsWith("new") ? "Nouveau" : "Détail" }];
}

/** Barre supérieure : déclencheur du menu mobile/tablette + fil d'Ariane de la page courante. */
export function Topbar({ title }: { title?: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const crumbs: Crumb[] = title ? [{ label: title }] : getBreadcrumb(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Ouvrir le menu"
          >
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="flex items-center gap-2.5 border-b px-4 py-3 text-base font-semibold">
            <Logo size={28} /> Nathafty
          </SheetTitle>
          <SidebarNav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <nav aria-label="Fil d'Ariane" className="flex min-w-0 items-center gap-1.5 text-sm">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <span key={crumb.label} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />}
              <span
                className={isLast ? "truncate font-semibold text-foreground" : "truncate text-muted-foreground"}
                aria-current={isLast ? "page" : undefined}
              >
                {crumb.label}
              </span>
            </span>
          );
        })}
      </nav>
    </header>
  );
}
