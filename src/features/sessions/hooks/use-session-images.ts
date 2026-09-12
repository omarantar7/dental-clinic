"use client";

import { useCallback, useEffect } from "react";

import { useApi } from "@/hooks/use-api";
import type { ImageResponse } from "@/types/images";

function useSessionImages(sessionId: string) {
  const { data, isLoading, error, request } = useApi<ImageResponse[]>();

  const refetch = useCallback(() => {
    request("GET", `/api/sessions/${sessionId}/images`);
  }, [request, sessionId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { images: data ?? [], isLoading, error, refetch };
}

export { useSessionImages };
