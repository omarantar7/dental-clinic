"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useApi } from "@/hooks/use-api";
import type { ImageResponse } from "@/types/images";

interface ImageFormValues {
  title: string;
  file: FileList | null;
}

interface UseImageFormOptions {
  patientId: string;
  mode: "create" | "edit";
  image?: ImageResponse;
  onSuccess: () => void;
}

function useImageForm({
  patientId,
  mode,
  image,
  onSuccess,
}: UseImageFormOptions) {
  const { request, isLoading, error } = useApi<ImageResponse>();

  const form = useForm<ImageFormValues>({
    defaultValues: { title: image?.title ?? "", file: null },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    const formData = new FormData();
    if (data.title) formData.append("title", data.title);
    if (data.file?.[0]) formData.append("file", data.file[0]);

    const url =
      mode === "create"
        ? `/api/patients/${patientId}/images`
        : `/api/patients/${patientId}/images/${image?.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const result = await request(method, url, formData);
    if (!result) return;

    toast.success(mode === "create" ? "Image added" : "Image updated");
    onSuccess();
  });

  return { form, onSubmit, isLoading, error };
}

export { useImageForm };
