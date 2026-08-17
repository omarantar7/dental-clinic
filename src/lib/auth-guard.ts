import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";
import { TokenUserPayload } from "@/config/types";
import { NotFoundException } from "@/exceptions/http/NotFoundException";
import { AuthorizationService } from "@/services/authorization.service";
import { ForbiddenException } from "@/exceptions/http/ForbiddenException";

const authService = new AuthService();

type Role = TokenUserPayload["role"];
type AuthContext = TokenUserPayload & { doctorId?: string };

export async function requireAuth(
  request: NextRequest,
  options: { roles?: Role[]; resolveDoctorId?: boolean } = {},
): Promise<AuthContext | NextResponse> {
  const authUser = authService.getAuthUser(request);

  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (options.roles && !options.roles.includes(authUser.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  if (options.resolveDoctorId) {
    try {
      const doctorId = await AuthorizationService.resolveDoctorId(authUser);
      return { ...authUser, doctorId };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return NextResponse.json({ message: error.message }, { status: 404 });
      }
      if (error instanceof ForbiddenException) {
        return NextResponse.json({ message: error.message }, { status: 403 });
      }
      return NextResponse.json(
        { message: "Something went wrong" },
        { status: 500 },
      );
    }
  }

  return authUser;
}
