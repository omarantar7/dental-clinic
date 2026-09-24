"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { useApi } from "@/hooks/use-api";
import {
  RequestPasswordResetSchema,
  type RequestPasswordResetInput,
} from "@/types/passwordReset";
import type { MessageResponse } from "@/features/auth/types/password-reset";

function useForgotPasswordForm() {
  const router = useRouter();
  const { request, isLoading, error } = useApi<MessageResponse>();

  const form = useForm<RequestPasswordResetInput>({
    resolver: zodResolver(RequestPasswordResetSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    const result = await request("POST", "/api/auth/password-reset", data);
    if (!result) return;

    router.push(`/forgot-password/verify?email=${encodeURIComponent(data.email)}`);
  });

  return { form, onSubmit, isLoading, error };
}

export { useForgotPasswordForm };
