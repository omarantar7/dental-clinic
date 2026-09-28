import type { PermissionCode } from "@/config/permissions";
import type { RoleListItem } from "@/types/role";

interface RoleFormDialogProps {
  mode: "create" | "edit";
  role?: RoleListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface PermissionChecklistProps {
  value: PermissionCode[];
  onChange: (value: PermissionCode[]) => void;
  disabled?: boolean;
}

export type { RoleFormDialogProps, PermissionChecklistProps };
