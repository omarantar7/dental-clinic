import { forbidden, redirect } from "next/navigation";

import { PERMISSIONS } from "@/config/permissions";
import { DashboardView } from "@/features/analytics/components/dashboard-view";
import { getAccessContext } from "@/lib/page-access";

export default async function Home() {
  const { permissions } = await getAccessContext();
  if (!permissions.has(PERMISSIONS.DASHBOARD_VIEW)) {
    // Everyone lands on "/" after login, so secretaries without the
    // dashboard go to their main page instead of a 403.
    if (permissions.has(PERMISSIONS.PATIENTS_VIEW)) redirect("/patients");
    forbidden();
  }

  return (
    <div className="flex flex-1 flex-col p-6">
      <DashboardView />
    </div>
  );
}
