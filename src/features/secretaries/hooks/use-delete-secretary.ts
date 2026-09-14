"use client";

import { toast } from "sonner";

import { useApi } from "@/hooks/use-api";

function useDeleteSecretary(onSuccess: () => void) {
  const { request, isLoading } = useApi<null>();

  const deleteSecretary = async (id: string) => {
    const result = await request("DELETE", `/api/secretaries/${id}`);
    if (result === undefined) return;

    toast.success("Secretary deleted");
    onSuccess();
  };

  return { deleteSecretary, isLoading };
}

export { useDeleteSecretary };
