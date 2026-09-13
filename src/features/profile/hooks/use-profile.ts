"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { TokenUserPayload } from "@/config/types";
import { useApi } from "@/hooks/use-api";
import type { DoctorProfile } from "@/types/doctor";
import type { SecretaryResponse } from "@/types/secertary";
import {
  ProfileFormSchema,
  type ProfileFormValues,
} from "@/features/profile/types/profile-form";

function useProfile(user: TokenUserPayload) {
  const { role } = user;
  const isDoctor = role === "DOCTOR";
  const fetchPath = isDoctor ? "/api/doctors/me" : "/api/secretaries/me";

  const {
    data: profile,
    request: fetchProfile,
    isLoading,
  } = useApi<DoctorProfile | SecretaryResponse>();
  const {
    request: submitRequest,
    isLoading: isSubmitting,
    error,
  } = useApi<DoctorProfile | SecretaryResponse>();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: { full_name: "", phone_number: "", clinic_address: "" },
  });

  useEffect(() => {
    fetchProfile("GET", fetchPath).then((data) => {
      if (!data) return;
      form.reset({
        full_name: data.full_name ?? "",
        phone_number: data.phone_number,
        clinic_address: "clinic_address" in data ? (data.clinic_address ?? "") : "",
      });
    });
  }, [fetchPath, fetchProfile, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    const payload = isDoctor
      ? data
      : { full_name: data.full_name, phone_number: data.phone_number };

    const result = await submitRequest("PATCH", fetchPath, payload);
    if (!result) return;

    toast.success("Profile updated");
  });

  if (isDoctor) {
    return {
      isDoctor: true as const,
      profile: profile as DoctorProfile | null,
      form,
      onSubmit,
      isLoading,
      isSubmitting,
      error,
    };
  }

  return {
    isDoctor: false as const,
    profile: profile as SecretaryResponse | null,
    form,
    onSubmit,
    isLoading,
    isSubmitting,
    error,
  };
}

export { useProfile };
