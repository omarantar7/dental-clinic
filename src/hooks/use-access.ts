"use client";

import { useCallback, useContext } from "react";

import type { PermissionCode } from "@/config/permissions";
import { PermissionsContext } from "@/components/providers/permissions-provider";

// UI-only: hides what the user can't do. The API enforces the same rules.
function useAccess() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("useAccess must be used inside PermissionsProvider");
  }

  const { role, permissions } = context;
  const can = useCallback(
    (code: PermissionCode) => permissions.has(code),
    [permissions],
  );

  return { isDoctor: role === "DOCTOR", can };
}

export { useAccess };
