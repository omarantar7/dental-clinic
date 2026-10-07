import type { PopoverAnchor } from "@/components/ui/responsive-popover";
import type { CalendarEvent } from "@/types/calendar";
import type { PatientListItem } from "@/types/patient";

// Inclusive YYYY-MM-DD bounds, as GET /api/calendar expects them.
type CalendarRange = { from: string; to: string };

type SessionProgress = Exclude<CalendarEvent["status"], "DELETED">;

interface SelectedSlot {
  start: Date;
  end: Date;
  anchor: PopoverAnchor;
}

interface SelectedEvent {
  event: CalendarEvent;
  anchor: PopoverAnchor;
}

interface CreateSessionTarget {
  patient: PatientListItem;
  start: Date;
  end: Date;
}

interface SlotPatientPickerProps {
  slot: SelectedSlot;
  onClose: () => void;
  onSelect: (patient: PatientListItem) => void;
}

interface SessionEventDetailsProps {
  selection: SelectedEvent;
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
  onChanged: () => void;
}

interface PatientAllergyBadgeProps {
  alergies: string | null;
}

export type {
  CalendarRange,
  SessionProgress,
  SelectedSlot,
  SelectedEvent,
  CreateSessionTarget,
  SlotPatientPickerProps,
  SessionEventDetailsProps,
  PatientAllergyBadgeProps,
};
