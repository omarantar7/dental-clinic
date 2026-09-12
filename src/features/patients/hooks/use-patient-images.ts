"use client";

import { useCallback, useEffect } from "react";

import { useApi } from "@/hooks/use-api";
import type { ImageResponse } from "@/types/images";

function usePatientImages(patientId: string) {
  const { data, isLoading, error, request } = useApi<ImageResponse[]>();

  const refetch = useCallback(() => {
    request("GET", `/api/patients/${patientId}/images`);
  }, [request, patientId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { images: data ?? [], isLoading, error, refetch };
}

export { usePatientImages };
