"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { NAV_ITEMS, type NavGroup, type NavLink } from "@/config/nav";
import { ProfileMenu } from "@/features/auth/components/profile-menu";

function NavLinkMenuItem({ item }: { item: NavLink }) {
  const pathname = usePathname();
  const isActive = pathname === item.href;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        tooltip={item.label}
        render={<Link href={item.href} />}
      >
        <item.icon />
        <span>{item.label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function NavGroupMenuItem({ item }: { item: NavGroup }) {
  const pathname = usePathname();

  return (
    <Collapsible className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger
          render={<SidebarMenuButton tooltip={item.label} />}
        >
          <item.icon />
          <span>{item.label}</span>
          <ChevronRight className="ml-auto transition-transform group-data-open/collapsible:rotate-90" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items.map((subItem) => (
              <SidebarMenuSubItem key={subItem.href}>
                <SidebarMenuSubButton
                  isActive={pathname === subItem.href}
                  render={<Link href={subItem.href} />}
                >
                  {subItem.label}
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

function AppSidebar() {
  const { isMobile, toggleSidebar } = useSidebar();

  return (
    <Sidebar collapsible="icon" side={isMobile ? "right" : "left"}>
      <SidebarHeader className="flex-row items-center justify-between py-6 md:pb-10">
        <div className="flex items-center gap-2 overflow-hidden px-2 group-data-[collapsible=icon]:hidden">
          <Image
            src="/dentalLogo.png"
            alt=""
            width={24}
            height={24}
            className="shrink-0"
          />
          <span className="truncate text-sm font-semibold">Dental Clinic</span>
        </div>
        {isMobile ? (
          <Button variant="ghost" size="icon-lg" onClick={toggleSidebar}>
            <X className="size-7.5" />
            <span className="sr-only">Close Sidebar</span>
          </Button>
        ) : (
          <SidebarTrigger />
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {NAV_ITEMS.map((item) =>
            item.type === "link" ? (
              <NavLinkMenuItem key={item.href} item={item} />
            ) : (
              <NavGroupMenuItem key={item.label} item={item} />
            ),
          )}
        </SidebarMenu>
      </SidebarContent>

      {isMobile && (
        <SidebarFooter>
          <ProfileMenu showLabel />
        </SidebarFooter>
      )}
    </Sidebar>
  );
}

export { AppSidebar };
