import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/handle-api-error";
import { parseQueryString } from "@/lib/helpers/query-parser";
import { SecretaryService } from "@/services/secertary.service";
import {
  parseSecretaryListQuery,
  SecretaryCreateSchema,
} from "@/types/secertary";

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

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, {
    roles: ["DOCTOR"],
    resolveDoctorId: true,
  });
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const parsedData = SecretaryCreateSchema.safeParse(body);

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
    const secretary = await SecretaryService.createSecretary(
      auth.doctorId!,
      parsedData.data,
    );
    return NextResponse.json(secretary, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
