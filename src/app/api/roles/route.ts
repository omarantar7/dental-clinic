import { NextRequest, NextResponse } from "next/server";
import { requireDoctorAuth } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/handle-api-error";
import { roleService } from "@/services/role.service";
import { RoleCreateSchema } from "@/types/role";

export async function GET(request: NextRequest) {
  const auth = await requireDoctorAuth(request, { roles: ["DOCTOR"] });
  if (auth instanceof NextResponse) return auth;

  try {
    const roles = await roleService.listRoles(auth.doctorId);
    return NextResponse.json(roles);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireDoctorAuth(request, { roles: ["DOCTOR"] });
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const parsedData = RoleCreateSchema.safeParse(body);

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
    const role = await roleService.createRole(auth.doctorId, parsedData.data);
    return NextResponse.json(role, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
