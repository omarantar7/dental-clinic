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
import { useSecretaryForm } from "@/features/secretaries/hooks/use-secretary-form";
import type { SecretaryFormDialogProps } from "../types/secretary-props";

function SecretaryFormDialog({
  mode,
  secretary,
  open,
  onOpenChange,
  onSuccess,
}: SecretaryFormDialogProps) {
  const { form, onSubmit, isSubmitting, error } = useSecretaryForm({
    mode,
    secretary,
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
      title={mode === "create" ? "Add Secretary" : "Edit Secretary"}
    >
      <form onSubmit={onSubmit} noValidate>
        <FieldGroup>
          {mode === "create" && (
            <>
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                <FieldError errors={[errors.email]} />
              </Field>

              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="password">
                  Temporary password
                </FieldLabel>
                <Input
                  id="password"
                  type="password"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
                <FieldError errors={[errors.password]} />
              </Field>
            </>
          )}

          <Field data-invalid={!!errors.full_name}>
            <FieldLabel htmlFor="full_name">Full name</FieldLabel>
            <Input
              id="full_name"
              aria-invalid={!!errors.full_name}
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
              {...register("phone_number")}
            />
            <FieldError errors={[errors.phone_number]} />
          </Field>

          {mode === "create" && (
            <>
              <Field data-invalid={!!errors.address}>
                <FieldLabel htmlFor="address">Address</FieldLabel>
                <Textarea
                  id="address"
                  aria-invalid={!!errors.address}
                  {...register("address")}
                />
                <FieldError errors={[errors.address]} />
              </Field>

              <Field data-invalid={!!errors.hired_at}>
                <FieldLabel htmlFor="hired_at">Hired at</FieldLabel>
                <Input
                  id="hired_at"
                  type="date"
                  aria-invalid={!!errors.hired_at}
                  {...register("hired_at")}
                />
                <FieldError errors={[errors.hired_at]} />
              </Field>
            </>
          )}

          {error && <FieldError>{error.message}</FieldError>}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting && <Spinner />}
            {mode === "create" ? "Add secretary" : "Save changes"}
          </Button>
        </FieldGroup>
      </form>
    </ResponsiveDialog>
  );
}

export { SecretaryFormDialog };
