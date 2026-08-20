import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/handle-api-error";
import { ImageCreateSchema } from "@/types/images";
import { ImageService } from "@/services/image.service";

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

  try {
    const formData = await request.formData();
    const parsedData = ImageCreateSchema.safeParse({
      title: formData.get("title"),
      file: formData.get("file"),
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

    const image = await ImageService.createSessionImage(
      id,
      auth.doctorId!,
      parsedData.data,
    );

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}