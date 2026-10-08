import { AuthService } from "@/services/auth.service";
import { NextResponse } from "next/server";

const authService = new AuthService();

export async function GET() {
  const res = NextResponse.json({ message: "Logged out" });

  authService.clearTokens(res);

  return res;
}
