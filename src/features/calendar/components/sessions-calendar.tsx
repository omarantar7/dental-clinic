"use client";

import { useEffect, useRef, useState } from "react";
import FullCalendar, {
  type CalendarRef,
  type DateSelectInfo,
  type EventClickInfo,
  type ToolbarInput,
} from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import listPlugin from "@fullcalendar/react/list";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import formaThemePlugin from "@fullcalendar/react/themes/forma";

import { Card, CardContent } from "@/components/ui/card";
import { PERMISSIONS } from "@/config/permissions";
import { useAccess } from "@/hooks/use-access";
import { useIsMobile } from "@/hooks/use-mobile";
import { SessionFormDialog } from "@/features/sessions/components/session-form-dialog";
import type { CalendarEvent } from "@/types/calendar";
import { useCalendarEvents } from "../hooks/use-calendar-events";
import { useRescheduleSession } from "../hooks/use-reschedule-session";
import type {
  CreateSessionTarget,
  SelectedEvent,
  SelectedSlot,
} from "../types/calendar-props";
import { PatientAllergyBadge } from "./patient-allergy-badge";
import { SessionEventDetails } from "./session-event-details";
import { SlotPatientPicker } from "./slot-patient-picker";

// Module-level so FullCalendar doesn't see a "new" plugin list each render.
const PLUGINS = [
  dayGridPlugin,
  timeGridPlugin,
  listPlugin,
  interactionPlugin,
  formaThemePlugin,
];

const EVENT_TIME_FORMAT = { hour: "numeric", minute: "2-digit" } as const;

const DESKTOP_TOOLBAR: ToolbarInput = {
  start: "prev,next today",
  center: "title",
  end: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
};

const MOBILE_TOOLBAR: ToolbarInput = {
  start: "prev,next",
  center: "title",
  end: "timeGridDay,listWeek",
};

// Picking a whole day in month view shouldn't prefill a 24h session.
function toDefaultAppointment(day: Date) {
  const start = new Date(day);
  start.setHours(9, 0, 0, 0);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 30);
  return { start, end };
}

const getSession = (info: EventClickInfo) =>
  (info.event.extendedProps as { session: CalendarEvent }).session;

function SessionsCalendar() {
  const calendarRef = useRef<CalendarRef>(null);
  const isMobile = useIsMobile();
  const { can } = useAccess();

  const { events, onDatesSet, refetch } = useCalendarEvents();
  const { reschedule, isRescheduling } = useRescheduleSession(refetch);

  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<SelectedEvent | null>(
    null,
  );
  const [createTarget, setCreateTarget] =
    useState<CreateSessionTarget | null>(null);
  const [editTarget, setEditTarget] = useState<CalendarEvent | null>(null);

  // Searching patients needs PATIENTS_VIEW on top of the right to create.
  const canCreate =
    can(PERMISSIONS.SESSIONS_CREATE) && can(PERMISSIONS.PATIENTS_VIEW);
  const canReschedule = can(PERMISSIONS.SESSIONS_UPDATE);

  // initialView is only read on mount; follow the viewport across resizes.
  useEffect(() => {
    calendarRef.current
      ?.getApi()
      .changeView(isMobile ? "timeGridDay" : "timeGridWeek");
  }, [isMobile]);

  const handleSelect = (info: DateSelectInfo) => {
    // Pointer position stands in for the slot: the selection highlight
    // isn't a stable element to anchor to.
    const point = info.jsEvent
      ? { x: info.jsEvent.clientX, y: info.jsEvent.clientY }
      : null;
    const { start, end } = info.allDay
      ? toDefaultAppointment(info.start)
      : info;
    setSelectedSlot({
      start,
      end,
      anchor: point
        ? { getBoundingClientRect: () => new DOMRect(point.x, point.y, 0, 0) }
        : null,
    });
  };

  const closeSlotPicker = () => {
    setSelectedSlot(null);
    calendarRef.current?.getApi().unselect();
  };

  const handleEventClick = (info: EventClickInfo) => {
    info.jsEvent.preventDefault();
    setSelectedEvent({ event: getSession(info), anchor: info.el });
  };

  return (
    <Card>
      <CardContent>
        <FullCalendar
          ref={calendarRef}
          plugins={PLUGINS}
          initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
          headerToolbar={isMobile ? MOBILE_TOOLBAR : DESKTOP_TOOLBAR}
          height="auto"
          slotMinTime="08:00:00"
          slotMaxTime="24:00:00"
          scrollTime="08:00:00"
          allDaySlot={false}
          nowIndicator
          // A fixed cap rather than `true`: auto mode renders an offscreen
          // probe with inert="", which React 19 warns about, and it measures
          // against fixed cell heights we don't have with height="auto".
          dayMaxEvents={3}
          eventTimeFormat={EVENT_TIME_FORMAT}
          events={events}
          datesSet={onDatesSet}
          eventClick={handleEventClick}
          selectable={canCreate}
          selectMirror
          select={handleSelect}
          // Editing is paused while a move saves, so a second drag can't
          // race (and abort) the first request.
          editable={canReschedule && !isRescheduling}
          eventDrop={reschedule}
          eventResize={reschedule}
          // Long-press before dragging/selecting so touch users can scroll.
          eventLongPressDelay={300}
          selectLongPressDelay={300}
        />
      </CardContent>

      {selectedSlot && (
        <SlotPatientPicker
          slot={selectedSlot}
          onClose={closeSlotPicker}
          onSelect={(patient) => {
            setCreateTarget({
              patient,
              start: selectedSlot.start,
              end: selectedSlot.end,
            });
            closeSlotPicker();
          }}
        />
      )}

      {selectedEvent && (
        <SessionEventDetails
          key={selectedEvent.event.id}
          selection={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={(event) => {
            setSelectedEvent(null);
            setEditTarget(event);
          }}
          onChanged={refetch}
        />
      )}

      {createTarget && (
        <SessionFormDialog
          mode="create"
          patientId={createTarget.patient.id}
          defaultStartDate={createTarget.start}
          defaultEndDate={createTarget.end}
          summary={
            <div className="flex items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2">
              <span className="truncate text-sm font-medium">
                {createTarget.patient.full_name}
              </span>
              <PatientAllergyBadge alergies={createTarget.patient.alergies} />
            </div>
          }
          open
          onOpenChange={(open) => !open && setCreateTarget(null)}
          onSuccess={refetch}
        />
      )}

      {editTarget && (
        <SessionFormDialog
          mode="edit"
          patientId={editTarget.patient_id}
          sessionId={editTarget.id}
          open
          onOpenChange={(open) => !open && setEditTarget(null)}
          onSuccess={refetch}
        />
      )}
    </Card>
  );
}

export { SessionsCalendar };
