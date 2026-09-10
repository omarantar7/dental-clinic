"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { useApi } from "@/hooks/use-api";

function useLogout() {
  const router = useRouter();
  const { request, isLoading } = useApi();

  const logout = useCallback(async () => {
    const result = await request("GET", "/api/auth/logout");
    if (!result) return;

    router.push("/login");
    router.refresh();
  }, [request, router]);

  return { logout, isLoading };
}

export { useLogout };
