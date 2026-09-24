"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { useApi } from "@/hooks/use-api";
import type { SecretaryListItem, SecretaryResponse } from "@/types/secertary";
import { toDateInputValue } from "@/utils/format";

function buildSchema(mode: "create" | "edit") {
  return z.object({
    email: mode === "create" ? z.email("Invalid email") : z.string(),
    password:
      mode === "create" ? z.string().min(8, "At least 8 characters") : z.string(),
    phone_number: z.string().min(1, "Phone number is required"),
    full_name: z.string().min(3, "At least 3 characters"),
    address: z.string(),
    hired_at: z.string(),
  });
}

type SecretaryFormValues = z.infer<ReturnType<typeof buildSchema>>;

interface UseSecretaryFormOptions {
  mode: "create" | "edit";
  secretary?: SecretaryListItem;
  onSuccess: () => void;
}

function useSecretaryForm({
  mode,
  secretary,
  onSuccess,
}: UseSecretaryFormOptions) {
  const { request, isLoading: isSubmitting, error } =
    useApi<SecretaryResponse>();

  const form = useForm<SecretaryFormValues>({
    resolver: zodResolver(buildSchema(mode)),
    defaultValues: {
      email: "",
      password: "",
      phone_number: "",
      full_name: "",
      address: "",
      hired_at: "",
    },
  });

  useEffect(() => {
    if (mode !== "edit" || !secretary) return;

    form.reset({
      email: secretary.email,
      password: "",
      phone_number: secretary.phone_number,
      full_name: secretary.full_name ?? "",
      address: "",
      hired_at: toDateInputValue(secretary.hired_at),
    });
  }, [mode, secretary, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    if (mode === "create") {
      const result = await request("POST", "/api/secretaries", {
        email: data.email,
        password: data.password,
        phone_number: data.phone_number,
        full_name: data.full_name,
        address: data.address || null,
        hired_at: data.hired_at || null,
      });
      if (!result) return;

      toast.success("Secretary added");
      onSuccess();
      return;
    }

    const result = await request("PATCH", `/api/secretaries/${secretary?.id}`, {
      full_name: data.full_name,
      phone_number: data.phone_number,
    });
    if (!result) return;

    toast.success("Secretary updated");
    onSuccess();
  });

  return { form, onSubmit, isSubmitting, error };
}

export { useSecretaryForm };
