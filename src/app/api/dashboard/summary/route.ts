import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/handle-api-error";
import { dashboardService } from "@/services/dashboard/dashboard.service";
import { DashboardQuerySchema } from "@/types/dashboard";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, {
    roles: ["DOCTOR", "SECRETARY"],
    resolveDoctorId: true,
  });
  if (auth instanceof NextResponse) return auth;

  const parsedQuery = DashboardQuerySchema.safeParse({
    from: request.nextUrl.searchParams.get("from"),
    to: request.nextUrl.searchParams.get("to"),
    granularity: request.nextUrl.searchParams.get("granularity") ?? undefined,
    newPatientsOnly:
      request.nextUrl.searchParams.get("newPatientsOnly") ?? undefined,
  });

  if (!parsedQuery.success) {
    return NextResponse.json(
      {
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        errors: parsedQuery.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 422 },
    );
  }

  try {
    const summary = await dashboardService.getSummary(
      auth.doctorId!,
      parsedQuery.data,
    );
    return NextResponse.json(summary);
  } catch (error) {
    return handleApiError(error);
  }
}
