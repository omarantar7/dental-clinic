import {
  Home,
  Users,
  IdCardLanyard,
  Calendar,
  GalleryHorizontalEnd,
  Image,
  SearchSlash,
  type LucideIcon,
} from "lucide-react";

import { PERMISSIONS, type PermissionCode } from "@/config/permissions";

// Visibility only; the page guards and the API enforce the same rules.
type NavAccess = {
  permission?: PermissionCode;
  doctorOnly?: boolean;
};

type NavLink = NavAccess & {
  type: "link";
  label: string;
  href: string;
  icon: LucideIcon;
  comingSoon?: boolean;
};

type NavGroup = NavAccess & {
  type: "group";
  label: string;
  icon: LucideIcon;
  items: NavLink[];
  comingSoon?: boolean;
};

type NavItem = NavLink | NavGroup;

const NAV_ITEMS: NavItem[] = [
  {
    type: "link",
    label: "Home",
    href: "/",
    icon: Home,
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
  {
    type: "link",
    label: "Patients",
    href: "/patients",
    icon: Users,
    permission: PERMISSIONS.PATIENTS_VIEW,
  },
  {
    type: "link",
    label: "Secretaries",
    href: "/secretaries",
    icon: IdCardLanyard,
    doctorOnly: true,
  },
  {
    type: "link",
    label: "Sessions Calendar",
    href: "/sessions-calendar",
    comingSoon: true,
    icon: Calendar,
    permission: PERMISSIONS.CALENDAR_VIEW,
  },
  {
    type: "group",
    label: "CMS Portfolio",
    icon: GalleryHorizontalEnd,
    comingSoon: true,
    doctorOnly: true,
    items: [
      {
        type: "link",
        label: "Portfolio Page",
        href: "/cms-portfolio",
        icon: Image,
        comingSoon: true,
      },
      {
        type: "link",
        label: "SEO",
        href: "/cms-portfolio/seo",
        icon: SearchSlash,
        comingSoon: true,
      },
    ],
  },
];

export { NAV_ITEMS, type NavItem, type NavLink, type NavGroup, type NavAccess };
