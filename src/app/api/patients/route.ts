import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/handle-api-error";
import { PatientService } from "@/services/patient.service";
import { parsePatientListQuery, PatientCreateSchema } from "@/types/patient";
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

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, {
    roles: ["DOCTOR", "SECRETARY"],
    resolveDoctorId: true,
  });
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const parsedData = PatientCreateSchema.safeParse(body);

  if (!parsedData.success) {
    return NextResponse.json(
      {
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        errors: parsedData.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 422 },
    );
  }

  try {
    const patient = await PatientService.createPatient(
      auth.doctorId!,
      parsedData.data,
    );
    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
