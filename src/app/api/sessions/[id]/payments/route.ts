import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/handle-api-error";
import { parseQueryString } from "@/lib/helpers/query-parser";
import { PaymentService } from "@/services/payment.service";
import { parsePaymentListQuery } from "@/types/payment";

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