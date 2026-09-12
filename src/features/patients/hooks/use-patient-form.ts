"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";

import { useApi } from "@/hooks/use-api";
import { PatientCreateSchema, type PatientDetail } from "@/types/patient";
import { toDateInputValue } from "@/utils/format";

type PatientFormValues = z.input<typeof PatientCreateSchema>;

interface UsePatientFormOptions {
  mode: "create" | "edit";
  patientId?: string;
  onSuccess: () => void;
}

function usePatientForm({ mode, patientId, onSuccess }: UsePatientFormOptions) {
  const {
    request: submitRequest,
    isLoading: isSubmitting,
    error,
  } = useApi<PatientDetail>();
  const { request: fetchDetail, isLoading: isLoadingDetail } =
    useApi<PatientDetail>();

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(PatientCreateSchema),
    defaultValues: {
      full_name: "",
      phone_number: "",
      gender: "MALE",
      birth_date: "",
      address: "",
      medical_history: "",
      alergies: "",
    },
  });

  useEffect(() => {
    if (mode !== "edit" || !patientId) return;

    fetchDetail("GET", `/api/patients/${patientId}`).then((patient) => {
      if (!patient) return;
      form.reset({
        full_name: patient.full_name,
        phone_number: patient.phone_number,
        gender: patient.gender,
        birth_date: toDateInputValue(patient.birth_date),
        address: patient.address ?? "",
        medical_history: patient.medical_history ?? "",
        alergies: patient.alergies ?? "",
      });
    });
  }, [mode, patientId, fetchDetail, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    const url =
      mode === "create" ? "/api/patients" : `/api/patients/${patientId}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const result = await submitRequest(method, url, data);
    if (!result) return;

    toast.success(mode === "create" ? "Patient added" : "Patient updated");
    onSuccess();
  });

  return {
    form,
    onSubmit,
    isSubmitting,
    isLoadingDetail: mode === "edit" && isLoadingDetail,
    error,
  };
}

export { usePatientForm };
