import {
  LayoutDashboard,
  Truck,
  CalendarDays,
  BadgeCheck,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/collections", label: "Collectes", icon: Truck },
  { href: "/admin/calendar", label: "Calendrier", icon: CalendarDays },
  { href: "/admin/subscriptions", label: "Abonnements", icon: BadgeCheck },
  { href: "/admin/drivers", label: "Collecteurs", icon: Users },
  { href: "/admin/expenses", label: "Dépenses", icon: Wallet },
];
