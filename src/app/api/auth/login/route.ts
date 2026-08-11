import { TokenUserPayload } from "@/config/types";
import { AuthService } from "@/services/auth.service";
import { UserService } from "@/services/user.service";
import { loginValidation } from "@/types/auth";
import { NextRequest, NextResponse } from "next/server";

const authService = new AuthService();

export async function POST(request: NextRequest) {
  const body = await request.json();

  const parsedData = loginValidation.safeParse(body);

  if (!parsedData.success) {
    return NextResponse.json(
      { message: "Email and password are required" },
      { status: 400 },
    );
  }

  try {
    const { data } = parsedData;
    const user = await UserService.validateUser(data.email, data.password);
    const userPayload: TokenUserPayload = { userId: user.id, role: user.role };
    const res = NextResponse.json({
      userId: user.id,
      role: user.role,
      permissions: [],
    });

    authService.persistAuth(res, userPayload);

    return res;
  } catch (error: any) {
    console.log(error);
    if (error.name === "NotFoundException") {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: error?.message }, { status: 500 });
  }
}
