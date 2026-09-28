import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/handle-api-error";
import { roleService } from "@/services/role.service";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, { roles: ["DOCTOR"] });
  if (auth instanceof NextResponse) return auth;

  try {
    const permissions = await roleService.listPermissions();
    return NextResponse.json(permissions);
  } catch (error) {
    return handleApiError(error);
  }
}
