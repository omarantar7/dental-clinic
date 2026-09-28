import type { PermissionCode } from "@/config/permissions";

// Resolved once per request: which doctor's data the user works on, and what
// they may do with it. Doctors hold every permission.
export type AccessContext = {
  doctorId: string;
  permissions: ReadonlySet<PermissionCode>;
};
