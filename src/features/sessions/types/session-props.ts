import type { ImageResponse } from "@/types/images";

interface SessionDetailViewProps {
  patientId: string;
  sessionId: string;
}

interface SessionFormDialogProps {
  mode: "create" | "edit";
  patientId: string;
  sessionId?: string;
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
