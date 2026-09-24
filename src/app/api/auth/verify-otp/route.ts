import { VerifyOtpSchema } from "@/types/passwordReset";
import { PasswordResetService } from "@/services/passwordReset.service";
import { InvalidOtpException } from "@/exceptions/http/InvalidOtpException";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsedData = VerifyOtpSchema.safeParse(body);

  if (!parsedData.success) {
    return NextResponse.json(
      { message: "Email and code are required" },
      { status: 400 },
    );
  }

  try {
    const result = await PasswordResetService.verifyOtp(
      parsedData.data.email,
      parsedData.data.otp_code,
    );
    return NextResponse.json(result, { status: 200 });
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
