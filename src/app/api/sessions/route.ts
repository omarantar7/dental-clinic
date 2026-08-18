import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/handle-api-error";
import { parseQueryString } from "@/lib/helpers/query-parser";
import { SessionService } from "@/services/session.service";
import { parseSessionListQuery, SessionCreateSchema } from "@/types/session";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, {
    roles: ["DOCTOR", "SECRETARY"],
    resolveDoctorId: true,
  });
  if (auth instanceof NextResponse) return auth;

  try {
    const rawQuery = parseQueryString(request.nextUrl.search);
    const parsedQuery = parseSessionListQuery(rawQuery);
    const result = await SessionService.listSessions(
      auth.doctorId!,
      parsedQuery,
    );
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, {
    roles: ["DOCTOR", "SECRETARY"],
    resolveDoctorId: true,
  });
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const parsedData = SessionCreateSchema.safeParse(body);

  if (!parsedData.success) {
    return NextResponse.json(
      {
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        errors: parsedData.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 422 },
    );
  }

  try {
    const session = await SessionService.createSession(
      auth.doctorId!,
      parsedData.data,
    );
    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
