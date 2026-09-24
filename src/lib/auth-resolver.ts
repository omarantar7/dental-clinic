import { AuthService } from "../services/auth.service";
import { TokenUserPayload } from "../config/types";

export type AuthResolution = {
  payload: TokenUserPayload | null;
  refreshedToken: string | null;
};

export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  resolve(token?: string, refreshToken?: string): AuthResolution {
    let payload = this.tryVerify(token);

    if (payload) {
      return { payload, refreshedToken: null };
    }

    if (!refreshToken) {
      return { payload: null, refreshedToken: null };
    }

    return this.tryRefresh(refreshToken);
  }

  private tryVerify(token?: string): TokenUserPayload | null {
    if (!token) return null;
    try {
      return this.authService.verifyToken(token);
    } catch {
      return null;
    }
  }

  private tryRefresh(refreshToken: string): AuthResolution {
    try {
      const newToken = this.authService.refreshToken(refreshToken);
      const payload = this.authService.verifyToken(newToken);
      return { payload, refreshedToken: newToken };
    } catch {
      return { payload: null, refreshedToken: null };
    }
  }
}
