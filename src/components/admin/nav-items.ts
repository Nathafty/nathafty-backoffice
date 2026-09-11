import {
  LayoutDashboard,
  Truck,
  CalendarDays,
  BadgeCheck,
  Users,
  Wallet,
  Home,
  MessageCircleWarning,
  MapPinned,
  CreditCard,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Section pas encore implémentée : lien actif, mais mène à une page "Bientôt disponible". */
  comingSoon?: boolean;
}

export interface NavGroup {
  /** Titre de section affiché au-dessus des liens (omis pour les groupes sans en-tête). */
  label?: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    items: [{ href: "/admin", label: "Tableau de bord", icon: LayoutDashboard }],
  },
  {
    label: "Opérations",
    items: [
      { href: "/admin/collections", label: "Collectes", icon: Truck },
      { href: "/admin/calendar", label: "Calendrier", icon: CalendarDays },
    ],
  },
  {
    label: "Clients",
    items: [
      { href: "/admin/households", label: "Ménages", icon: Home },
      { href: "/admin/complaints", label: "Réclamations", icon: MessageCircleWarning },
      { href: "/admin/subscriptions", label: "Abonnements", icon: BadgeCheck },
    ],
  },
  {
    label: "Ressources",
    items: [
      { href: "/admin/drivers", label: "Collecteurs", icon: Users },
      { href: "/admin/fleet", label: "Véhicules & Districts", icon: MapPinned },
    ],
  },
  {
    label: "Finances",
    items: [
      { href: "/admin/expenses", label: "Dépenses", icon: Wallet },
      { href: "/admin/payments", label: "Paiements", icon: CreditCard, comingSoon: true },
    ],
  },
  {
    items: [{ href: "/admin/settings", label: "Paramètres", icon: Settings, comingSoon: true }],
  },
];

/** Liste plate, utile pour retrouver un item par pathname (breadcrumb, etc.). */
export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
