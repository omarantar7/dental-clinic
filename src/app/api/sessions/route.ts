import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/handle-api-error";
import { parseQueryString } from "@/lib/helpers/query-parser";
import { SessionService } from "@/services/session.service";
import { parseSessionListQuery } from "@/types/session";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, {
    roles: ["DOCTOR", "SECRETARY"],
    resolveDoctorId: true,
  });
  if (auth instanceof NextResponse) return auth;

  try {
    const rawQuery = parseQueryString(request.nextUrl.search);
    const parsedQuery = parseSessionListQuery(rawQuery);
    const result = await SessionService.listSessions(auth.doctorId!, parsedQuery);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

