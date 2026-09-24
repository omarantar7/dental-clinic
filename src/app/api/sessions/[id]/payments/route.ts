import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/handle-api-error";
import { parseQueryString } from "@/lib/helpers/query-parser";
import { PaymentService } from "@/services/payment.service";
import {
  parsePaymentListQuery,
  PaymentCreateSchema,
} from "@/types/payment";

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
    const rawQuery = parseQueryString(request.nextUrl.search);
    const parsedQuery = parsePaymentListQuery(rawQuery);
    const payments = await PaymentService.listBySessionId(
      id,
      auth.doctorId!,
      parsedQuery,
    );
    return NextResponse.json(payments);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request, {
    roles: ["DOCTOR", "SECRETARY"],
    resolveDoctorId: true,
  });
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = await request.json();
  const parsedData = PaymentCreateSchema.safeParse(body);

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
    const payment = await PaymentService.createForSession(
      id,
      auth.doctorId!,
      parsedData.data,
    );
    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}