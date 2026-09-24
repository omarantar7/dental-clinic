"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { useApi } from "@/hooks/use-api";
import { VerifyOtpSchema } from "@/types/passwordReset";
import type { VerifyOtpResponse } from "@/features/auth/types/password-reset";

const VerifyOtpFormSchema = VerifyOtpSchema.pick({ otp_code: true });
type VerifyOtpFormInput = { otp_code: string };

function useVerifyOtpForm(email: string) {
  const router = useRouter();
  const { request, isLoading, error } = useApi<VerifyOtpResponse>();

  const form = useForm<VerifyOtpFormInput>({
    resolver: zodResolver(VerifyOtpFormSchema),
    defaultValues: { otp_code: "" },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    const result = await request("POST", "/api/auth/verify-otp", {
      email,
      otp_code: data.otp_code,
    });
    if (!result) return;

    router.push(
      `/forgot-password/reset?reset_id=${encodeURIComponent(result.reset_id)}`,
    );
  });

  return { form, onSubmit, isLoading, error };
}

export { useVerifyOtpForm };
