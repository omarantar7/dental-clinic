import { cache } from "react";
import { headers } from "next/headers";

import { AuthService } from "@/services/auth.service";
import { TokenUserPayload } from "@/config/types";

const authService = new AuthService();

const getCurrentUser = cache(async (): Promise<TokenUserPayload> => {
  const headerStore = await headers();
  const userPayload = authService.getAuthUser(headerStore);

  return userPayload as TokenUserPayload;
});

export { getCurrentUser };
