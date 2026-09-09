"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { useApi } from "@/hooks/use-api";
import { ConfirmNewPasswordSchema } from "@/types/passwordReset";
import type { MessageResponse } from "@/features/auth/types/password-reset";

const SUCCESS_TOAST_DURATION_MS = 4_000;
const LOGIN_REDIRECT_DELAY_MS = 3_000;

const ResetPasswordFormSchema = ConfirmNewPasswordSchema.pick({
  new_password: true,
})
  .extend({ confirm_password: z.string() })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type ResetPasswordFormInput = z.infer<typeof ResetPasswordFormSchema>;

function useResetPasswordForm(resetId: string) {
  const router = useRouter();
  const { request, isLoading, error } = useApi<MessageResponse>();

  const form = useForm<ResetPasswordFormInput>({
    resolver: zodResolver(ResetPasswordFormSchema),
    defaultValues: { new_password: "", confirm_password: "" },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    const result = await request("POST", "/api/auth/password-reset/confirm", {
      reset_id: resetId,
      new_password: data.new_password,
    });
    if (!result) return;

    toast.success(result.message, { duration: SUCCESS_TOAST_DURATION_MS });
    setTimeout(() => router.push("/login"), LOGIN_REDIRECT_DELAY_MS);
  });

  return { form, onSubmit, isLoading, error };
}

export { useResetPasswordForm };
