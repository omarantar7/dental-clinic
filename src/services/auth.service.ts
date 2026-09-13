import config from "@/config";
import { TokenUserPayload } from "@/config/types";
import {
  InvalidTokenException,
  TokenExpiredException,
} from "@/exceptions/http/AuthenticationException";
import jwt, { SignOptions } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import ms, { StringValue } from "ms";

export class AuthService {
  constructor(
    private secretKey = config.auth.secretKey,
    private tokenExpiration = config.auth.tokenExpiration,
    private refreshTokenExpiration = config.auth.refreshTokenExpiration,
  ) {}

  generateToken(payload: TokenUserPayload): string {
    return jwt.sign(payload, this.secretKey, {
      expiresIn: this.tokenExpiration as SignOptions["expiresIn"],
    });
  }

  generateRefreshToken(payload: TokenUserPayload): string {
    return jwt.sign(payload, this.secretKey, {
      expiresIn: this.refreshTokenExpiration as SignOptions["expiresIn"],
    });
  }

  verifyToken(token: string): TokenUserPayload {
    try {
      return jwt.verify(token, this.secretKey) as TokenUserPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new TokenExpiredException();
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new InvalidTokenException();
      }
      throw new Error("Token Verification Failed");
    }
  }

  refreshToken(refreshToken: string): string {
    const payload = this.verifyToken(refreshToken);
    if (!payload) {
      throw new InvalidTokenException();
    }
    return this.generateToken(payload);
  }

  setTokenIntoCookie(res: NextResponse, token: string): void {
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: config.isProd,
      maxAge: Math.floor(ms(this.tokenExpiration as StringValue) / 1000),
    });
  }

  setRefreshTokenIntoCookie(res: NextResponse, refreshToken: string): void {
    res.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.isProd,
      maxAge: Math.floor(ms(this.refreshTokenExpiration as StringValue) / 1000),
    });
  }

  clearTokens(res: NextResponse) {
    res.cookies.delete("token");
    res.cookies.delete("refreshToken");
  }

  persistAuth(res: NextResponse, payload: TokenUserPayload): void {
    const token = this.generateToken(payload);
    const refreshToken = this.generateRefreshToken(payload);
    this.setTokenIntoCookie(res, token);
    this.setRefreshTokenIntoCookie(res, refreshToken);
  }

  getAuthUser(headers: Pick<Headers, "get">): TokenUserPayload | null {
    const raw = headers.get("user-payload");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as TokenUserPayload;
    } catch {
      return null;
    }
  }
}
