import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/config/permissions";
import { handleApiError } from "@/lib/handle-api-error";
import { PaymentService } from "@/services/payment.service";
import { PaymentUpdateSchema } from "@/types/payment";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request, {
    roles: ["DOCTOR", "SECRETARY"],
    permission: PERMISSIONS.PAYMENTS_UPDATE,
    resolveDoctorId: true,
  });
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsedData = PaymentUpdateSchema.safeParse(body);

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

    const payment = await PaymentService.updatePayment(
      id,
      auth.doctorId!,
      parsedData.data,
    );
    return NextResponse.json(payment);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request, {
    roles: ["DOCTOR", "SECRETARY"],
    permission: PERMISSIONS.PAYMENTS_DELETE,
    resolveDoctorId: true,
  });
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    await PaymentService.deletePayment(id, auth.doctorId!);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}