"use client";

import { createContext, useMemo } from "react";

import type { PermissionCode } from "@/config/permissions";
import type { Role } from "@/config/roles";

type PermissionsContextValue = {
  role: Role;
  permissions: ReadonlySet<PermissionCode>;
};

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

// Receives an array because server-to-client props must be serializable.
function PermissionsProvider({
  role,
  permissions,
  children,
}: {
  role: Role;
  permissions: PermissionCode[];
  children: React.ReactNode;
}) {
  const value = useMemo(
    () => ({ role, permissions: new Set(permissions) }),
    [role, permissions],
  );

  return <PermissionsContext value={value}>{children}</PermissionsContext>;
}

export { PermissionsProvider, PermissionsContext, type PermissionsContextValue };
