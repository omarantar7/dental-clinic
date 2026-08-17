import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/handle-api-error";
import { PatientService } from "@/services/patient.service";
import { parsePatientListQuery } from "@/types/patient";
import { parseQueryString } from "@/lib/helpers/query-parser";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, {
    roles: ["DOCTOR", "SECRETARY"],
    resolveDoctorId: true,
  });
  if (auth instanceof NextResponse) return auth;

  try {
    const rawQuery = parseQueryString(request.nextUrl.search);
    const parsedQuery = parsePatientListQuery(rawQuery);
    const result = await PatientService.listPatients(
      auth.doctorId!,
      parsedQuery,
    );
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
