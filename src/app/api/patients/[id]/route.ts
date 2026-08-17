import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/handle-api-error";
import { PatientService } from "@/services/patient.service";

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
    const patient = await PatientService.getPatient(id, auth.doctorId!);
    return NextResponse.json(patient);
  } catch (error) {
    return handleApiError(error);
  }
}
