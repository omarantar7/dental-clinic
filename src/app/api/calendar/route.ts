import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/handle-api-error";
import { CalendarService } from "@/services/calendar.service";
import { CalendarQuerySchema } from "@/types/calendar";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, {
    roles: ["DOCTOR", "SECRETARY"],
    resolveDoctorId: true,
  });
  if (auth instanceof NextResponse) return auth;

  const parsedQuery = CalendarQuerySchema.safeParse({
    from: request.nextUrl.searchParams.get("from"),
    to: request.nextUrl.searchParams.get("to"),
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
    const events = await CalendarService.getEvents(
      auth.doctorId!,
      parsedQuery.data.from,
      parsedQuery.data.to,
    );
    return NextResponse.json(events);
  } catch (error) {
    return handleApiError(error);
  }
}