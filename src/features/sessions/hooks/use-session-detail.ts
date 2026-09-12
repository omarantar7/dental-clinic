"use client";

import { useCallback, useEffect } from "react";

import { useApi } from "@/hooks/use-api";
import type { SessionDetail } from "@/types/session";

function useSessionDetail(sessionId: string) {
  const {
    data: session,
    error,
    isLoading,
    request,
  } = useApi<SessionDetail>();

  const refetch = useCallback(() => {
    request("GET", `/api/sessions/${sessionId}`);
  }, [request, sessionId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { session, isLoading, error, refetch };
}

export { useSessionDetail };
