import type { ReactNode } from "react";

import type { ImageResponse } from "@/types/images";

interface SessionDetailViewProps {
  patientId: string;
  sessionId: string;
}

interface SessionFormDialogProps {
  mode: "create" | "edit";
  patientId: string;
  sessionId?: string;
  // Prefill for create mode, e.g. the slot picked on the calendar.
  defaultStartDate?: Date;
  defaultEndDate?: Date;
  // Rendered above the fields, e.g. the selected patient and allergy warning.
  summary?: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface SessionImageFormDialogProps {
  sessionId: string;
  mode: "create" | "edit";
  image?: ImageResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export type {
  SessionDetailViewProps,
  SessionFormDialogProps,
  SessionImageFormDialogProps,
};
