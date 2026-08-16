import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";
import { TokenUserPayload } from "@/config/types";

const authService = new AuthService();

type Role = TokenUserPayload["role"];

export function requireAuth(
  request: NextRequest,
  allowedRoles?: Role[],
): TokenUserPayload | NextResponse {
  const authUser = authService.getAuthUser(request);

  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (allowedRoles && !allowedRoles.includes(authUser.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  return authUser;
}