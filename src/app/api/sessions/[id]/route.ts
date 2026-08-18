import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/handle-api-error";
import { SessionService } from "@/services/session.service";
import { SessionUpdateSchema } from "@/types/session";

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
    const session = await SessionService.getSession(id, auth.doctorId!);
    return NextResponse.json(session);
  } catch (error) {
    return handleApiError(error);
  }
}