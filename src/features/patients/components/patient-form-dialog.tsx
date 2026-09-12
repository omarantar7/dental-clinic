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
import { usePatientForm } from "@/features/patients/hooks/use-patient-form";
import type { PatientFormDialogProps } from "../types/patient-props";

function PatientFormDialog({
  mode,
  patientId,
  open,
  onOpenChange,
  onSuccess,
}: PatientFormDialogProps) {
  const { form, onSubmit, isSubmitting, isLoadingDetail, error } =
    usePatientForm({
      mode,
      patientId,
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
      title={mode === "create" ? "Add Patient" : "Edit Patient"}
    >
      <form onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <Field data-invalid={!!errors.full_name}>
            <FieldLabel htmlFor="full_name">Full name</FieldLabel>
            <Input
              id="full_name"
              aria-invalid={!!errors.full_name}
              disabled={isLoadingDetail}
              {...register("full_name")}
            />
            <FieldError errors={[errors.full_name]} />
          </Field>

          <Field data-invalid={!!errors.phone_number}>
            <FieldLabel htmlFor="phone_number">Phone number</FieldLabel>
            <Input
              id="phone_number"
              type="tel"
              aria-invalid={!!errors.phone_number}
              disabled={isLoadingDetail}
              {...register("phone_number")}
            />
            <FieldError errors={[errors.phone_number]} />
          </Field>

          <Field data-invalid={!!errors.gender}>
            <FieldLabel htmlFor="gender">Gender</FieldLabel>
            <Controller
              control={control}
              name="gender"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLoadingDetail}
                >
                  <SelectTrigger id="gender" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.gender]} />
          </Field>

          <Field data-invalid={!!errors.birth_date}>
            <FieldLabel htmlFor="birth_date">Birth date</FieldLabel>
            <Input
              id="birth_date"
              type="date"
              aria-invalid={!!errors.birth_date}
              disabled={isLoadingDetail}
              {...register("birth_date")}
            />
            <FieldError errors={[errors.birth_date]} />
          </Field>

          <Field data-invalid={!!errors.address}>
            <FieldLabel htmlFor="address">Address</FieldLabel>
            <Textarea
              id="address"
              aria-invalid={!!errors.address}
              disabled={isLoadingDetail}
              {...register("address")}
            />
            <FieldError errors={[errors.address]} />
          </Field>

          <Field data-invalid={!!errors.medical_history}>
            <FieldLabel htmlFor="medical_history">Medical history</FieldLabel>
            <Textarea
              id="medical_history"
              aria-invalid={!!errors.medical_history}
              disabled={isLoadingDetail}
              {...register("medical_history")}
            />
            <FieldError errors={[errors.medical_history]} />
          </Field>

          <Field data-invalid={!!errors.alergies}>
            <FieldLabel htmlFor="alergies">Allergies</FieldLabel>
            <Textarea
              id="alergies"
              aria-invalid={!!errors.alergies}
              disabled={isLoadingDetail}
              {...register("alergies")}
            />
            <FieldError errors={[errors.alergies]} />
          </Field>

          {error && <FieldError>{error.message}</FieldError>}

          <Button
            type="submit"
            disabled={isSubmitting || isLoadingDetail}
            className="w-full"
          >
            {isSubmitting && <Spinner />}
            {mode === "create" ? "Add patient" : "Save changes"}
          </Button>
        </FieldGroup>
      </form>
    </ResponsiveDialog>
  );
}

export { PatientFormDialog };
