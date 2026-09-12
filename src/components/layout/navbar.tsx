"use client";

import Image from "next/image";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { ProfileMenu } from "@/features/auth/components/profile-menu";

function MobileSidebarTrigger() {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon-lg"
      className="ml-auto md:hidden"
      onClick={toggleSidebar}
    >
      <Menu className="size-7.5" />
      <span className="sr-only">Open Sidebar</span>
    </Button>
  );
}

function Navbar() {
  return (
    <header className="flex h-12 items-center border-b border-border bg-transparent px-4">
      <div className="flex items-center gap-2 md:hidden">
        <Image src="/dentalLogo.png" alt="" width={24} height={24} />
        <span className="text-sm font-semibold">BRIGHT SMILE</span>
      </div>
      <MobileSidebarTrigger />
      <div className="ml-auto hidden items-center gap-2 md:flex">
        <ProfileMenu />
      </div>
    </header>
  );
}

export { Navbar };
