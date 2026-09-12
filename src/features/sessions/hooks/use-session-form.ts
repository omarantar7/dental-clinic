"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";

import { useApi } from "@/hooks/use-api";
import { SessionUpdateSchema, type SessionDetail } from "@/types/session";
import { toDateTimeInputValue } from "@/utils/format";

type SessionFormValues = z.input<typeof SessionUpdateSchema>;

interface UseSessionFormOptions {
  mode: "create" | "edit";
  patientId: string;
  sessionId?: string;
  onSuccess: () => void;
}

function useSessionForm({
  mode,
  patientId,
  sessionId,
  onSuccess,
}: UseSessionFormOptions) {
  const {
    request: submitRequest,
    isLoading: isSubmitting,
    error,
  } = useApi<SessionDetail>();
  const { request: fetchDetail, isLoading: isLoadingDetail } =
    useApi<SessionDetail>();

  const form = useForm<SessionFormValues>({
    resolver: zodResolver(SessionUpdateSchema),
    defaultValues: {
      session_name: "",
      session_start_date: "",
      session_end_date: "",
      total_amount: 0,
      status: "UNCOMPLETED",
      diagnosis: "",
      tooth_numbers: "",
      description: "",
      extra_notes: "",
    },
  });

  useEffect(() => {
    if (mode !== "edit" || !sessionId) return;

    fetchDetail("GET", `/api/sessions/${sessionId}`).then((session) => {
      if (!session) return;
      form.reset({
        session_name: session.session_name,
        session_start_date: toDateTimeInputValue(session.session_start_date),
        session_end_date: toDateTimeInputValue(session.session_end_date),
        total_amount: session.total_amount,
        status: session.status,
        diagnosis: session.diagnosis ?? "",
        tooth_numbers: session.tooth_numbers ?? "",
        description: session.description ?? "",
        extra_notes: session.extra_notes ?? "",
      });
    });
  }, [mode, sessionId, fetchDetail, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    const url =
      mode === "create" ? "/api/sessions" : `/api/sessions/${sessionId}`;
    const method = mode === "create" ? "POST" : "PATCH";
    const body = mode === "create" ? { ...data, patient_id: patientId } : data;

    const result = await submitRequest(method, url, body);
    if (!result) return;

    toast.success(mode === "create" ? "Session added" : "Session updated");
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

export { useSessionForm };
