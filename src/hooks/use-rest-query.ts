"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import qs from "qs";

import { useApi, type ApiError } from "@/hooks/use-api";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

interface RestQueryOptions {
  searchFields?: string[];
  defaultSort?: string;
  perPage?: number;
}

interface RestQueryResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}

interface UseRestQueryResult<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  isLoading: boolean;
  error: ApiError | null;
  search: string;
  setSearch: (value: string) => void;
  setPage: (page: number) => void;
  sort: string;
  setSort: (sort: string) => void;
  refetch: () => void;
}

function useRestQuery<T>(
  url: string,
  options: RestQueryOptions = {},
): UseRestQueryResult<T> {
  const { searchFields = [], defaultSort = "", perPage = 20 } = options;

  const {
    data: response,
    error,
    isLoading,
    request,
  } = useApi<RestQueryResponse<T>>();
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(defaultSort);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 500);

  const queryString = useMemo(() => {
    const searchQuery =
      debouncedSearch && searchFields.length > 0
        ? {
            or: searchFields.map((field) => ({
              [field]: { like: debouncedSearch },
            })),
          }
        : undefined;

    return qs.stringify(
      {
        page,
        "per-page": perPage,
        sort: sort || undefined,
        search: searchQuery,
      },
      { skipNulls: true },
    );
  }, [page, perPage, sort, debouncedSearch, searchFields]);

  const fetchPage = useCallback(() => {
    request("GET", `${url}?${queryString}`);
  }, [request, url, queryString]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  const handleSetSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleSetSort = useCallback((value: string) => {
    setSort(value);
    setPage(1);
  }, []);

  return {
    data: response?.data ?? [],
    page: response?.page ?? page,
    limit: response?.limit ?? perPage,
    total: response?.total ?? 0,
    isLoading,
    error,
    search,
    setSearch: handleSetSearch,
    setPage,
    sort,
    setSort: handleSetSort,
    refetch: fetchPage,
  };
}

export { useRestQuery, type UseRestQueryResult };
