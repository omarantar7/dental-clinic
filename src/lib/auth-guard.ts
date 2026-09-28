import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";
import { TokenUserPayload } from "@/config/types";
import type { PermissionCode } from "@/config/permissions";
import { authorizationService } from "@/services/authorization.service";
import { HttpException } from "@/exceptions/http/HttpException";
import { InsufficientPermissionException } from "@/exceptions/http/AuthorizationException";

const authService = new AuthService();

type Role = TokenUserPayload["role"];
type AuthContext = TokenUserPayload & { doctorId?: string };
type AuthOptions = {
  roles?: Role[];
  resolveDoctorId?: boolean;
  permission?: PermissionCode;
};

export async function requireAuth(
  request: NextRequest,
  options: AuthOptions = {},
): Promise<AuthContext | NextResponse> {
  const authUser = authService.getAuthUser(request.headers);

  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (options.roles && !options.roles.includes(authUser.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  // Secretaries are always resolved so a disabled account loses access
  // immediately, even on routes that need neither a doctorId nor a permission.
  const needsAccessContext =
    authUser.role === "SECRETARY" ||
    options.resolveDoctorId ||
    options.permission !== undefined;

  if (!needsAccessContext) return authUser;

  try {
    const access = await authorizationService.getAccessContext(authUser);
    if (options.permission && !access.permissions.has(options.permission)) {
      throw new InsufficientPermissionException();
    }
    return { ...authUser, doctorId: access.doctorId };
  } catch (error) {
    if (error instanceof HttpException) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }
    console.error(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}

type DoctorAuthContext = TokenUserPayload & { doctorId: string };

/**
 * requireAuth for doctor-scoped routes: always resolves the doctorId,
 * so callers get it typed as `string` without a non-null assertion.
 */
export async function requireDoctorAuth(
  request: NextRequest,
  options: Omit<AuthOptions, "resolveDoctorId"> = {},
): Promise<DoctorAuthContext | NextResponse> {
  const auth = await requireAuth(request, {
    ...options,
    resolveDoctorId: true,
  });
  if (auth instanceof NextResponse) return auth;

  const { doctorId } = auth;
  if (!doctorId) {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }

  return { ...auth, doctorId };
}
