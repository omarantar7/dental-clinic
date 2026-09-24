"use client";

import { toast } from "sonner";

import { useApi } from "@/hooks/use-api";

function useDeletePatientImage(patientId: string, onSuccess: () => void) {
  const { request, isLoading } = useApi<null>();

  const deleteImage = async (imageId: string) => {
    const result = await request(
      "DELETE",
      `/api/patients/${patientId}/images/${imageId}`,
    );
    if (result === undefined) return;

    toast.success("Image deleted");
    onSuccess();
  };

  return { deleteImage, isLoading };
}

export { useDeletePatientImage };
