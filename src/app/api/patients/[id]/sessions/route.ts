import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/handle-api-error";
import { PatientService } from "@/services/patient.service";
import { SessionService } from "@/services/session.service";
import { parseSessionListQuery } from "@/types/session";
import { parseQueryString } from "@/lib/helpers/query-parser";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request, {
    roles: ["DOCTOR", "SECRETARY"],
    resolveDoctorId: true,
  });
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  try {
    await PatientService.getPatient(id, auth.doctorId!);

    const rawQuery = parseQueryString(request.nextUrl.search);
    const parsedQuery = parseSessionListQuery(rawQuery);

    const result = await SessionService.getSessionsForPatient(
      id,
      auth.doctorId!,
      parsedQuery,
    );
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
