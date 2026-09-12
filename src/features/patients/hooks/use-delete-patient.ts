"use client";

import { toast } from "sonner";

import { useApi } from "@/hooks/use-api";

function useDeletePatient(onSuccess: () => void) {
  const { request, isLoading } = useApi<null>();

  const deletePatient = async (id: string) => {
    const result = await request("DELETE", `/api/patients/${id}`);
    if (result === undefined) return;

    toast.success("Patient deleted");
    onSuccess();
  };

  return { deletePatient, isLoading };
}

export { useDeletePatient };
