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

type NavLink = {
  type: "link";
  label: string;
  href: string;
  icon: LucideIcon;
  comingSoon?: boolean;
};

type NavGroup = {
  type: "group";
  label: string;
  icon: LucideIcon;
  items: NavLink[];
  comingSoon?: boolean;
};

type NavItem = NavLink | NavGroup;

const NAV_ITEMS: NavItem[] = [
  { type: "link", label: "Home", href: "/", icon: Home },
  { type: "link", label: "Patients", href: "/patients", icon: Users },
  {
    type: "link",
    label: "Secretaries",
    href: "/secretaries",
    icon: IdCardLanyard,
  },
  {
    type: "link",
    label: "Sessions Calendar",
    href: "/sessions-calendar",
    icon: Calendar,
  },
  {
    type: "group",
    label: "CMS Portfolio",
    icon: GalleryHorizontalEnd,
    comingSoon: true,
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

export { NAV_ITEMS, type NavItem, type NavLink, type NavGroup };
