import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/handle-api-error";
import { ImageService } from "@/services/image.service";
import { ImageUpdateSchema } from "@/types/images";

export async function PATCH(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string; imageId: string }>;
  },
) {
  const auth = await requireAuth(request, {
    roles: ["DOCTOR", "SECRETARY"],
    resolveDoctorId: true,
  });
  if (auth instanceof NextResponse) return auth;

  const { id, imageId } = await params;

  try {
    const formData = await request.formData();
    const parsedData = ImageUpdateSchema.safeParse({
      title: formData.get("title") ?? undefined,
      file: formData.get("file") ?? undefined,
    });

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

    const image = await ImageService.updateSessionImage(
      id,
      auth.doctorId!,
      imageId,
      parsedData.data,
    );

    return NextResponse.json(image);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string; imageId: string }>;
  },
) {
  const auth = await requireAuth(request, {
    roles: ["DOCTOR", "SECRETARY"],
    resolveDoctorId: true,
  });
  if (auth instanceof NextResponse) return auth;

  const { id, imageId } = await params;

  try {
    await ImageService.deleteSessionImage(id, auth.doctorId!, imageId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}