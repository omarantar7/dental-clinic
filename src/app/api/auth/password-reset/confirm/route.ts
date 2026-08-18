import { ConfirmNewPasswordSchema } from "@/types/passwordReset";
import { PasswordResetService } from "@/services/passwordReset.service";
import { InvalidOtpException } from "@/exceptions/http/InvalidOtpException";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsedData = ConfirmNewPasswordSchema.safeParse(body);

  if (!parsedData.success) {
    return NextResponse.json(
      { message: "reset_id and new_password are required" },
      { status: 400 },
    );
  }

  try {
    await PasswordResetService.confirmNewPassword(
      parsedData.data.reset_id,
      parsedData.data.new_password,
    );
    return NextResponse.json(
      { message: "Password updated successfully." },
      { status: 200 },
    );
  } catch (error: any) {
    if (error instanceof InvalidOtpException) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    console.log(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
