"use client";

import { toast } from "sonner";

import { useApi } from "@/hooks/use-api";

function useDeleteSession(onSuccess: () => void) {
  const { request, isLoading } = useApi<null>();

  const deleteSession = async (id: string) => {
    const result = await request("DELETE", `/api/sessions/${id}`);
    if (result === undefined) return;

    toast.success("Session deleted");
    onSuccess();
  };

  return { deleteSession, isLoading };
}

export { useDeleteSession };
