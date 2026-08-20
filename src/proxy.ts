import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "./services/auth.service";
import { AuthResolver } from "./lib/auth-resolver";
import { matchesRoute } from "./lib/route-matcher";
import {
  unauthorized,
  redirectAuthenticatedAwayFromPublic,
} from "./lib/proxy-responses";

const authResolver = new AuthResolver(new AuthService());

const PROTECTED_ROUTES = [
  "/api/dashboard",
  "/api/doctors/me",
  "/api/patients",
  "/api/sessions",
  "/api/calendar",
  "/api/payments",
];
const PUBLIC_ROUTES = ["/api/auth/login", "/api/auth/logout"];

export function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = matchesRoute(path, PROTECTED_ROUTES);
  const isPublicRoute = matchesRoute(path, PUBLIC_ROUTES);

  if (!isProtectedRoute && !isPublicRoute) {
    return NextResponse.next();
  }

  const { payload, refreshedToken } = authResolver.resolve(
    req.cookies.get("token")?.value,
    req.cookies.get("refreshToken")?.value,
  );

  if (isProtectedRoute && !payload?.userId) {
    return unauthorized(req);
  }

  if (isPublicRoute && payload?.userId) {
    return redirectAuthenticatedAwayFromPublic(req);
  }

  const requestHeaders = new Headers(req.headers);
  if (payload) {
    requestHeaders.set("user-payload", JSON.stringify(payload));
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  if (refreshedToken) {
    new AuthService().setTokenIntoCookie(response, refreshedToken);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
