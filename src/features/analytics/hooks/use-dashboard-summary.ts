"use client";

import { useCallback, useEffect } from "react";

import { useApi } from "@/hooks/use-api";
import type { DashboardSummary } from "@/types/dashboard";

interface UseDashboardSummaryOptions {
  from: string;
  to: string;
  newPatientsOnly: boolean;
}

function useDashboardSummary({
  from,
  to,
  newPatientsOnly,
}: UseDashboardSummaryOptions) {
  const {
    data: summary,
    error,
    isLoading,
    request,
  } = useApi<DashboardSummary>();

  const refetch = useCallback(() => {
    request(
      "GET",
      `/api/dashboard/summary?from=${from}&to=${to}&newPatientsOnly=${newPatientsOnly}`,
    );
  }, [request, from, to, newPatientsOnly]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { summary, isLoading, error, refetch };
}

export { useDashboardSummary };
