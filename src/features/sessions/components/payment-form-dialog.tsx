"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { usePaymentForm } from "@/features/sessions/hooks/use-payment-form";
import type { PaymentFormDialogProps } from "../types/sessions-payment-props";

function PaymentFormDialog({
  mode,
  sessionId,
  payment,
  open,
  onOpenChange,
  onSuccess,
}: PaymentFormDialogProps) {
  const { form, onSubmit, isSubmitting, error } = usePaymentForm({
    mode,
    sessionId,
    payment,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess();
    },
  });
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "create" ? "Add Payment" : "Edit Payment"}
    >
      <form onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <Field data-invalid={!!errors.amount}>
            <FieldLabel htmlFor="amount">Amount</FieldLabel>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              aria-invalid={!!errors.amount}
              {...register("amount", { valueAsNumber: true })}
            />
            <FieldError errors={[errors.amount]} />
          </Field>

          <Field data-invalid={!!errors.payment_date}>
            <FieldLabel htmlFor="payment_date">Payment date</FieldLabel>
            <Input
              id="payment_date"
              type="date"
              aria-invalid={!!errors.payment_date}
              {...register("payment_date")}
            />
            <FieldError errors={[errors.payment_date]} />
          </Field>

          <Field data-invalid={!!errors.notes}>
            <FieldLabel htmlFor="notes">Notes</FieldLabel>
            <Textarea
              id="notes"
              aria-invalid={!!errors.notes}
              {...register("notes")}
            />
            <FieldError errors={[errors.notes]} />
          </Field>

          {error && <FieldError>{error.message}</FieldError>}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting && <Spinner />}
            {mode === "create" ? "Add payment" : "Save changes"}
          </Button>
        </FieldGroup>
      </form>
    </ResponsiveDialog>
  );
}

export { PaymentFormDialog };
