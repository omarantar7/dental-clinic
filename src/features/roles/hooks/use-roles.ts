"use client";

import { useCallback, useEffect } from "react";

import { useApi } from "@/hooks/use-api";
import type { RoleListItem } from "@/types/role";

function useRoles() {
  const { data, isLoading, error, request } = useApi<RoleListItem[]>();

  const refetch = useCallback(() => {
    request("GET", "/api/roles");
  }, [request]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { roles: data ?? [], isLoading, error, refetch };
}

export { useRoles };
