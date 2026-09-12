"use client";

import { Controller } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useSessionForm } from "@/features/sessions/hooks/use-session-form";
import type { SessionFormDialogProps } from "../types/session-props";

function SessionFormDialog({
  mode,
  patientId,
  sessionId,
  open,
  onOpenChange,
  onSuccess,
}: SessionFormDialogProps) {
  const { form, onSubmit, isSubmitting, isLoadingDetail, error } =
    useSessionForm({
      mode,
      patientId,
      sessionId,
      onSuccess: () => {
        onOpenChange(false);
        onSuccess();
      },
    });
  const {
    register,
    control,
    formState: { errors },
  } = form;

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "create" ? "Add Session" : "Edit Session"}
    >
      <form onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <Field data-invalid={!!errors.session_name}>
            <FieldLabel htmlFor="session_name">Session name</FieldLabel>
            <Input
              id="session_name"
              aria-invalid={!!errors.session_name}
              disabled={isLoadingDetail}
              {...register("session_name")}
            />
            <FieldError errors={[errors.session_name]} />
          </Field>

          <Field data-invalid={!!errors.session_start_date}>
            <FieldLabel htmlFor="session_start_date">Start</FieldLabel>
            <Input
              id="session_start_date"
              type="datetime-local"
              aria-invalid={!!errors.session_start_date}
              disabled={isLoadingDetail}
              {...register("session_start_date")}
            />
            <FieldError errors={[errors.session_start_date]} />
          </Field>

          <Field data-invalid={!!errors.session_end_date}>
            <FieldLabel htmlFor="session_end_date">End</FieldLabel>
            <Input
              id="session_end_date"
              type="datetime-local"
              aria-invalid={!!errors.session_end_date}
              disabled={isLoadingDetail}
              {...register("session_end_date")}
            />
            <FieldError errors={[errors.session_end_date]} />
          </Field>

          <Field data-invalid={!!errors.total_amount}>
            <FieldLabel htmlFor="total_amount">Total amount</FieldLabel>
            <Input
              id="total_amount"
              type="number"
              step="0.01"
              min="0"
              aria-invalid={!!errors.total_amount}
              disabled={isLoadingDetail}
              {...register("total_amount", { valueAsNumber: true })}
            />
            <FieldError errors={[errors.total_amount]} />
          </Field>

          {mode === "edit" && (
            <Field data-invalid={!!errors.status}>
              <FieldLabel htmlFor="status">Status</FieldLabel>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoadingDetail}
                  >
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UNCOMPLETED">Uncompleted</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.status]} />
            </Field>
          )}

          <Field data-invalid={!!errors.diagnosis}>
            <FieldLabel htmlFor="diagnosis">Diagnosis</FieldLabel>
            <Input
              id="diagnosis"
              aria-invalid={!!errors.diagnosis}
              disabled={isLoadingDetail}
              {...register("diagnosis")}
            />
            <FieldError errors={[errors.diagnosis]} />
          </Field>

          <Field data-invalid={!!errors.tooth_numbers}>
            <FieldLabel htmlFor="tooth_numbers">Tooth numbers</FieldLabel>
            <Input
              id="tooth_numbers"
              aria-invalid={!!errors.tooth_numbers}
              disabled={isLoadingDetail}
              {...register("tooth_numbers")}
            />
            <FieldError errors={[errors.tooth_numbers]} />
          </Field>

          <Field data-invalid={!!errors.description}>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Textarea
              id="description"
              aria-invalid={!!errors.description}
              disabled={isLoadingDetail}
              {...register("description")}
            />
            <FieldError errors={[errors.description]} />
          </Field>

          <Field data-invalid={!!errors.extra_notes}>
            <FieldLabel htmlFor="extra_notes">Extra notes</FieldLabel>
            <Textarea
              id="extra_notes"
              aria-invalid={!!errors.extra_notes}
              disabled={isLoadingDetail}
              {...register("extra_notes")}
            />
            <FieldError errors={[errors.extra_notes]} />
          </Field>

          {error && <FieldError>{error.message}</FieldError>}

          <Button
            type="submit"
            disabled={isSubmitting || isLoadingDetail}
            className="w-full"
          >
            {isSubmitting && <Spinner />}
            {mode === "create" ? "Add session" : "Save changes"}
          </Button>
        </FieldGroup>
      </form>
    </ResponsiveDialog>
  );
}

export { SessionFormDialog };
