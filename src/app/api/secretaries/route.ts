import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/handle-api-error";
import { parseQueryString } from "@/lib/helpers/query-parser";
import { SecretaryService } from "@/services/secertary.service";
import { parseSecretaryListQuery } from "@/types/secertary";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, {
    roles: ["DOCTOR"],
    resolveDoctorId: true,
  });
  if (auth instanceof NextResponse) return auth;

  try {
    const rawQuery = parseQueryString(request.nextUrl.search);
    const query = parseSecretaryListQuery(rawQuery);
    const result = await SecretaryService.listSecretaries(
      auth.doctorId!,
      query,
    );
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
