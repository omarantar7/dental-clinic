import { cache } from "react";
import { forbidden, unauthorized } from "next/navigation";

import type { PermissionCode } from "@/config/permissions";
import { AuthenticationException } from "@/exceptions/http/AuthenticationException";
import { getCurrentUser } from "@/lib/get-current-user";
import { authorizationService } from "@/services/authorization.service";
import type { AccessContext } from "@/types/authorization";

// Cached per request, so the layout and the page guard share one query.
const getAccessContext = cache(async (): Promise<AccessContext> => {
  const user = await getCurrentUser();
  try {
    return await authorizationService.getAccessContext(user);
  } catch (error) {
    // A disabled/deleted secretary whose token hasn't expired yet.
    if (error instanceof AuthenticationException) unauthorized();
    throw error;
  }
});

async function requirePagePermission(
  code: PermissionCode,
): Promise<AccessContext> {
  const access = await getAccessContext();
  if (!access.permissions.has(code)) forbidden();
  return access;
}

async function requireDoctorPage(): Promise<void> {
  const user = await getCurrentUser();
  if (user.role !== "DOCTOR") forbidden();
}

export { getAccessContext, requirePagePermission, requireDoctorPage };
