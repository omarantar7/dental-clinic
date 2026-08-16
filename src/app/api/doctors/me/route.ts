import { NextRequest, NextResponse } from "next/server";
import { DoctorService } from "@/services/doctor.service";
import { requireAuth } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/handle-api-error";

export async function GET(request: NextRequest) {
  const authUser = requireAuth(request, ["DOCTOR"]);
  if (authUser instanceof NextResponse) return authUser;

  try {
    const profile = await DoctorService.getMyProfile(authUser.userId);
    return NextResponse.json(profile);
  } catch (error) {
    return handleApiError(error);
  }
}

