"use client";

import { toast } from "sonner";
import type { EventChangeInfo } from "@fullcalendar/react";

import { useApi } from "@/hooks/use-api";
import type { SessionDetail } from "@/types/session";

// FullCalendar moves the event optimistically; we persist it and roll the
// move back if the API refuses it.
function useRescheduleSession(onSuccess: () => void) {
  const { request, isLoading } = useApi<SessionDetail>();

  const reschedule = async ({ event, revert }: EventChangeInfo) => {
    if (!event.start || !event.end) {
      revert();
      return;
    }

    const result = await request("PATCH", `/api/sessions/${event.id}`, {
      session_start_date: event.start.toISOString(),
      session_end_date: event.end.toISOString(),
    });

    if (!result) {
      revert();
      toast.error("Could not reschedule the session");
      return;
    }

    toast.success("Session rescheduled");
    onSuccess();
  };

  return { reschedule, isRescheduling: isLoading };
}

export { useRescheduleSession };
