import { RequestPasswordResetSchema } from "@/types/passwordReset";
import { PasswordResetService } from "@/services/passwordReset.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsedData = RequestPasswordResetSchema.safeParse(body);

  if (!parsedData.success) {
    return NextResponse.json(
      { message: "A valid email is required" },
      { status: 400 },
    );
  }

  try {
    await PasswordResetService.requestReset(parsedData.data.email);

    return NextResponse.json(
      { message: "A reset code has been sent." },
      { status: 200 },
    );
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
