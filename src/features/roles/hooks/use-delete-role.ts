"use client";

import { toast } from "sonner";

import { useApi } from "@/hooks/use-api";

// Exposes `error` (unlike the other delete hooks) because the expected failure
// — a role still assigned to secretaries — needs to be shown to the doctor.
function useDeleteRole(onSuccess: () => void) {
  const { request, isLoading, error, reset } = useApi<null>();

  const deleteRole = async (id: string) => {
    const result = await request("DELETE", `/api/roles/${id}`);
    if (result === undefined) return;

    toast.success("Role deleted");
    onSuccess();
  };

  return { deleteRole, isLoading, error, reset };
}

export { useDeleteRole };
