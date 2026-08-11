import { NextRequest } from "next/server";
import { Role } from "./roles";
import { JwtPayload } from "jsonwebtoken";

export interface TokenUserPayload {
  userId: string;
  role: Role;
}

export interface TokenPayload extends JwtPayload {
  user: TokenUserPayload;
}
export interface AuthenticatedRequest extends NextRequest {
  user: TokenUserPayload;
}
