"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
  const { isMobile, setOpenMobile } = useSidebar();
  const isActive = !item.comingSoon && pathname === item.href;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        tooltip={item.label}
        aria-disabled={item.comingSoon}
        className={item.comingSoon ? "pointer-events-none opacity-60" : undefined}
        onClick={() => isMobile && setOpenMobile(false)}
        render={item.comingSoon ? undefined : <Link href={item.href} />}
      >
        <item.icon />
        <span className="truncate">{item.label}</span>
        {item.comingSoon && (
          <Badge variant="secondary" className="ml-auto shrink-0">
            Coming soon
          </Badge>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function NavGroupMenuItem({ item }: { item: NavGroup }) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <Collapsible className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger
          render={<SidebarMenuButton tooltip={item.label} />}
        >
          <item.icon />
          <span className="truncate">{item.label}</span>
          {item.comingSoon && (
            <Badge variant="secondary" className="ml-2 shrink-0">
              Coming soon
            </Badge>
          )}
          <ChevronRight className="ml-auto shrink-0 transition-transform group-data-open/collapsible:rotate-90" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items.map((subItem) => (
              <SidebarMenuSubItem key={subItem.href}>
                <SidebarMenuSubButton
                  isActive={!subItem.comingSoon && pathname === subItem.href}
                  aria-disabled={subItem.comingSoon}
                  className={
                    subItem.comingSoon
                      ? "pointer-events-none opacity-60"
                      : undefined
                  }
                  onClick={() => isMobile && setOpenMobile(false)}
                  render={subItem.comingSoon ? undefined : <Link href={subItem.href} />}
                >
                  <span className="truncate">{subItem.label}</span>
                  {subItem.comingSoon && (
                    <Badge variant="secondary" className="ml-auto shrink-0">
                      Coming soon
                    </Badge>
                  )}
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
      <SidebarHeader className="flex-row items-center justify-between py-6 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-3 md:pb-10">
        <div className="flex items-center gap-2 overflow-hidden px-2">
          <Image
            src="/dentalLogo.png"
            alt=""
            width={24}
            height={24}
            className="shrink-0"
          />
          <span className="truncate text-sm font-semibold group-data-[collapsible=icon]:hidden">
            Dental Clinic
          </span>
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
