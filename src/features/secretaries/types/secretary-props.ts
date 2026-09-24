import type { SecretaryListItem } from "@/types/secertary";

interface SecretaryFormDialogProps {
  mode: "create" | "edit";
  secretary?: SecretaryListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export type { SecretaryFormDialogProps };
