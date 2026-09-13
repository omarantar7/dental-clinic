import { NextRequest, NextResponse } from "next/server";
import { SecretaryService } from "@/services/secertary.service";
import { SecretaryUpdateProfileSchema } from "@/types/secertary";
import { requireAuth } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/handle-api-error";

export async function GET(request: NextRequest) {
  const authUser = await requireAuth(request, { roles: ["SECRETARY"] });
  if (authUser instanceof NextResponse) return authUser;

  try {
    const profile = await SecretaryService.getMyProfile(authUser.userId);
    return NextResponse.json(profile);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  const authUser = await requireAuth(request, { roles: ["SECRETARY"] });
  if (authUser instanceof NextResponse) return authUser;

  const body = await request.json();
  const parsedData = SecretaryUpdateProfileSchema.safeParse(body);

  if (!parsedData.success) {
    return NextResponse.json(
      { message: "Invalid data", errors: parsedData.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const profile = await SecretaryService.updateMyProfile(
      authUser.userId,
      parsedData.data,
    );
    return NextResponse.json(profile);
  } catch (error) {
    return handleApiError(error);
  }
}
