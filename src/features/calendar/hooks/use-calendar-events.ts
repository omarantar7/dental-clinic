"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import qs from "qs";
import { toast } from "sonner";
import type { DatesSetInfo, EventInput } from "@fullcalendar/react";

import { useApi } from "@/hooks/use-api";
import type { CalendarRange } from "@/features/calendar/types/calendar-props";
import type { CalendarEvent } from "@/types/calendar";

const pad = (n: number) => String(n).padStart(2, "0");

const toLocalDateString = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// The API reads from/to as UTC days while the grid shows local days, so a
// session near local midnight can fall just outside the requested range.
// Padding a day on each side covers any timezone offset. FullCalendar's end
// is exclusive, so end itself is already "last visible day + 1".
function toPaddedRange(start: Date, end: Date): CalendarRange {
  const from = new Date(start);
  from.setDate(from.getDate() - 1);
  return { from: toLocalDateString(from), to: toLocalDateString(end) };
}

// Colors live in globals.css so they follow light/dark mode.
const STATUS_COLORS: Record<CalendarEvent["status"], string> = {
  UNCOMPLETED: "var(--session-uncompleted)",
  COMPLETED: "var(--session-completed)",
  DELETED: "var(--muted-foreground)",
};

const toEventInput = (event: CalendarEvent): EventInput => ({
  id: event.id,
  title: `${event.patient_name} · ${event.session_name}`,
  start: event.start,
  end: event.end,
  color: STATUS_COLORS[event.status],
  contrastColor: "var(--session-event-foreground)",
  extendedProps: { session: event },
});

function useCalendarEvents() {
  const { data, error, isLoading, request } = useApi<CalendarEvent[]>();
  const [range, setRange] = useState<CalendarRange | null>(null);

  const refetch = useCallback(() => {
    if (!range) return;
    request("GET", `/api/calendar?${qs.stringify(range)}`);
  }, [range, request]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (error) toast.error(error.message);
  }, [error]);

  const onDatesSet = useCallback((info: DatesSetInfo) => {
    const next = toPaddedRange(info.start, info.end);
    setRange((prev) =>
      prev?.from === next.from && prev.to === next.to ? prev : next,
    );
  }, []);

  const events = useMemo(() => (data ?? []).map(toEventInput), [data]);

  return { events, isLoading, onDatesSet, refetch };
}

export { useCalendarEvents };
