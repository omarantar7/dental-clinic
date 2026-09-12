"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";

import { useApi } from "@/hooks/use-api";
import { PaymentUpdateSchema, type Payment } from "@/types/payment";
import { toDateInputValue } from "@/utils/format";
import type { UsePaymentFormOptions } from "../types/sessions-payment-props";

type PaymentFormValues = z.input<typeof PaymentUpdateSchema>;

function usePaymentForm({
  mode,
  sessionId,
  payment,
  onSuccess,
}: UsePaymentFormOptions) {
  const { request, isLoading: isSubmitting, error } = useApi<Payment>();

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(PaymentUpdateSchema),
    defaultValues: {
      amount: payment?.amount ?? 0,
      payment_date: toDateInputValue(payment?.payment_date ?? new Date()),
      notes: payment?.notes ?? "",
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    const url =
      mode === "create"
        ? `/api/sessions/${sessionId}/payments`
        : `/api/payments/${payment?.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const result = await request(method, url, data);
    if (!result) return;

    toast.success(mode === "create" ? "Payment added" : "Payment updated");
    onSuccess();
  });

  return { form, onSubmit, isSubmitting, error };
}

export { usePaymentForm };
