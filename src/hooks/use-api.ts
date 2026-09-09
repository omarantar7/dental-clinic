"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type ApiFieldError = {
  field: string;
  message: string;
};

type ApiError = {
  message: string;
  status: number;
  code?: string;
  errors?: ApiFieldError[];
};

type UseApiState<T> = {
  data: T | null;
  error: ApiError | null;
  isLoading: boolean;
};

async function parseResponseBody<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text) return null;
  return JSON.parse(text) as T;
}

function useApi<T = unknown>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

  const request = useCallback(
    async (
      method: HttpMethod,
      url: string,
      body?: unknown,
    ): Promise<T | undefined> => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch(url, {
          method,
          credentials: "same-origin",
          headers:
            body !== undefined ? { "Content-Type": "application/json" } : undefined,
          body: body !== undefined ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        const payload = await parseResponseBody<T | ApiError>(response);

        if (!response.ok) {
          const errorPayload = payload as Partial<ApiError> | null;
          const error: ApiError = {
            message: errorPayload?.message ?? "Something went wrong",
            status: response.status,
            code: errorPayload?.code,
            errors: errorPayload?.errors,
          };
          setState({ data: null, error, isLoading: false });
          return undefined;
        }

        const data = payload as T;
        setState({ data, error: null, isLoading: false });
        return data;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return undefined;
        }
        const error: ApiError = {
          message: err instanceof Error ? err.message : "Network error",
          status: 0,
        };
        setState({ data: null, error, isLoading: false });
        return undefined;
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false });
  }, []);

  return { ...state, request, reset };
}

export { useApi, type HttpMethod, type ApiFieldError, type ApiError };
