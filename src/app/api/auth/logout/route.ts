import { AuthService } from "@/services/auth.service";
import { NextRequest, NextResponse } from "next/server";

const authService = new AuthService();

export async function GET(request: NextRequest) {
  const res = NextResponse.json({ message: "Logged out" });

  authService.clearTokens(res);

  return res;
}
