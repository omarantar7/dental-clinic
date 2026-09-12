import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "./services/auth.service";
import { AuthResolver } from "./lib/auth-resolver";
import { matchesRoute } from "./utils/route-matcher";
import {
  unauthorized,
  redirectAuthenticatedAwayFromPublic,
} from "./lib/proxy-responses";

const authResolver = new AuthResolver(new AuthService());

// API routes are public by default; only listed paths require auth.
const PROTECTED_API_ROUTES = [
  "/api/dashboard",
  "/api/doctors/me",
  "/api/patients",
  "/api/sessions",
  "/api/calendar",
  "/api/payments",
  "/api/secretaries",
];
const PUBLIC_API_ROUTES = [
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/password-reset",
  "/api/auth/verify-otp",
];

// Pages are protected by default; only listed paths are public.
const PUBLIC_PAGE_ROUTES = ["/login", "/forgot-password"];

export function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (path.startsWith("/api")) {
    return handleApiRoute(req, path);
  }

  return handlePageRoute(req, path);
}

function handleApiRoute(req: NextRequest, path: string): NextResponse {
  const isProtected = matchesRoute(path, PROTECTED_API_ROUTES);
  const isPublic = matchesRoute(path, PUBLIC_API_ROUTES);

  if (!isProtected && !isPublic) {
    return NextResponse.next();
  }

  return resolveAndRespond(req, isProtected, isPublic);
}

function handlePageRoute(req: NextRequest, path: string): NextResponse {
  const isPublic = matchesRoute(path, PUBLIC_PAGE_ROUTES);

  return resolveAndRespond(req, !isPublic, isPublic);
}

function resolveAndRespond(
  req: NextRequest,
  isProtected: boolean,
  isPublic: boolean,
): NextResponse {
  const { payload, refreshedToken } = authResolver.resolve(
    req.cookies.get("token")?.value,
    req.cookies.get("refreshToken")?.value,
  );

  if (isProtected && !payload?.userId) {
    return unauthorized(req);
  }

  if (isPublic && payload?.userId) {
    return redirectAuthenticatedAwayFromPublic(req);
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.delete("user-payload");
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
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json|webmanifest|css|js|map|woff2?|ttf)$).*)",
  ],
};
