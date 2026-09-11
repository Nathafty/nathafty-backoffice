"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_GROUPS } from "./nav-items";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Liste des liens de navigation (partagée desktop + mobile), groupée par section. */
export function SidebarNav({
  onNavigate,
  collapsed = false,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-4 p-3" aria-label="Navigation principale">
      {NAV_GROUPS.map((group, i) => (
        <div key={group.label ?? `group-${i}`} className="flex flex-col gap-1">
          {group.label && !collapsed && (
            <h3 className="px-3 pt-2 pb-1 text-xs font-semibold tracking-wide text-sidebar-foreground/50 uppercase">
              {group.label}
            </h3>
          )}
          {group.items.map(({ href, label, icon: Icon, comingSoon }) => {
            const active = isActive(pathname, href);
            const linkContent = (
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                aria-label={collapsed ? label : undefined}
                className={cn(
                  "flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                  collapsed && "justify-center px-2",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                {!collapsed && (
                  <span className="flex flex-1 items-center justify-between gap-2">
                    {label}
                    {comingSoon && (
                      <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">
                        Bientôt
                      </Badge>
                    )}
                  </span>
                )}
              </Link>
            );

            return (
              <div key={href}>
                {collapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right">
                      {label}
                      {comingSoon ? " (bientôt)" : ""}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  linkContent
                )}
              </div>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
