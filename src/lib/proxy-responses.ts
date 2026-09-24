import { NextRequest, NextResponse } from "next/server";

export function unauthorized(req: NextRequest): NextResponse {
  if (req.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/login", req.nextUrl));
}

export function redirectAuthenticatedAwayFromPublic(
  req: NextRequest,
): NextResponse {
  if (req.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL("/", req.nextUrl));
}
