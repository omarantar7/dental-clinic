import { Heading } from "@/components/ui/heading";
import { PERMISSIONS } from "@/config/permissions";
import { LazySessionsCalendar } from "@/features/calendar/components/lazy-sessions-calendar";
import { requirePagePermission } from "@/lib/page-access";

export default async function SessionsCalendarPage() {
  await requirePagePermission(PERMISSIONS.CALENDAR_VIEW);

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <Heading level={1}>Sessions Calendar</Heading>
      <LazySessionsCalendar />
    </div>
  );
}
