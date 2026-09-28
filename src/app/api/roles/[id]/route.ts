import { NextRequest, NextResponse } from "next/server";
import { requireDoctorAuth } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/handle-api-error";
import { roleService } from "@/services/role.service";
import { RoleUpdateSchema } from "@/types/role";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireDoctorAuth(request, { roles: ["DOCTOR"] });
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = await request.json();
  const parsedData = RoleUpdateSchema.safeParse(body);

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
    const role = await roleService.updateRole(
      id,
      auth.doctorId,
      parsedData.data,
    );
    return NextResponse.json(role);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireDoctorAuth(request, { roles: ["DOCTOR"] });
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  try {
    await roleService.deleteRole(id, auth.doctorId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
