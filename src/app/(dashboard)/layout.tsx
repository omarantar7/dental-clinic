import { cookies } from "next/headers";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { Navbar } from "@/components/layout/navbar";
import { PermissionsProvider } from "@/components/providers/permissions-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getCurrentUser } from "@/lib/get-current-user";
import { getAccessContext } from "@/lib/page-access";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";
  const [user, access] = await Promise.all([
    getCurrentUser(),
    getAccessContext(),
  ]);

  return (
    <PermissionsProvider
      role={user.role}
      permissions={[...access.permissions]}
    >
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <SidebarInset>
          <Navbar />
          <div className="flex flex-1 flex-col">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </PermissionsProvider>
  );
}
