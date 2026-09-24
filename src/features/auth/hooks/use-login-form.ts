"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { useApi } from "@/hooks/use-api";
import { loginValidation, type LoginValidationType } from "@/types/auth";
import type { LoginResponse } from "@/features/auth/types/login";

function useLoginForm() {
  const router = useRouter();
  const { request, isLoading, error } = useApi<LoginResponse>();

  const form = useForm<LoginValidationType>({
    resolver: zodResolver(loginValidation),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    const result = await request("POST", "/api/auth/login", data);
    if (!result) return;

    router.push("/");
    router.refresh();
  });

  return { form, onSubmit, isLoading, error };
}

export { useLoginForm };
