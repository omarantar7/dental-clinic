import type { ImageResponse } from "@/types/images";

interface PatientFormDialogProps {
  mode: "create" | "edit";
  patientId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface PatientImageFormDialogProps {
  patientId: string;
  mode: "create" | "edit";
  image?: ImageResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export type { PatientFormDialogProps, PatientImageFormDialogProps };
