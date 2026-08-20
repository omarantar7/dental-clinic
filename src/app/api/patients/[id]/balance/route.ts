import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/handle-api-error";
import { PatientService } from "@/services/patient.service";
import { SessionService } from "@/services/session.service";

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

    const balance = await SessionService.getPatientBalance(id, auth.doctorId!);
    return NextResponse.json(balance);
  } catch (error) {
    return handleApiError(error);
  }
}
