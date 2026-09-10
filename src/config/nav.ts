import { Home, Users, type LucideIcon } from "lucide-react";

type NavLink = {
  type: "link";
  label: string;
  href: string;
  icon: LucideIcon;
};

type NavGroup = {
  type: "group";
  label: string;
  icon: LucideIcon;
  items: NavLink[];
};

type NavItem = NavLink | NavGroup;

const NAV_ITEMS: NavItem[] = [
  { type: "link", label: "Home", href: "/", icon: Home },
  { type: "link", label: "Patients", href: "/patients", icon: Users },
];

export { NAV_ITEMS, type NavItem, type NavLink, type NavGroup };
