"use client";

import { toast } from "sonner";

import { useApi } from "@/hooks/use-api";

function useDeletePayment(onSuccess: () => void) {
  const { request, isLoading } = useApi<null>();

  const deletePayment = async (id: string) => {
    const result = await request("DELETE", `/api/payments/${id}`);
    if (result === undefined) return;

    toast.success("Payment deleted");
    onSuccess();
  };

  return { deletePayment, isLoading };
}

export { useDeletePayment };
