"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Heading } from "@/components/ui/heading";
import { PasswordInput } from "@/components/ui/password-input";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useResetPasswordForm } from "@/features/auth/hooks/use-reset-password-form";

function ResetPasswordForm({ resetId }: { resetId: string }) {
  const { form, onSubmit, isLoading, error } = useResetPasswordForm(resetId);
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Heading level={1}>Set a new password</Heading>
        <Text>Choose a new password for your account.</Text>
      </div>

      <form onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <Field data-invalid={!!errors.new_password}>
            <FieldLabel htmlFor="new_password">New password</FieldLabel>
            <PasswordInput
              id="new_password"
              autoComplete="new-password"
              aria-invalid={!!errors.new_password}
              {...register("new_password")}
            />
            <FieldError errors={[errors.new_password]} />
          </Field>

          <Field data-invalid={!!errors.confirm_password}>
            <FieldLabel htmlFor="confirm_password">
              Confirm new password
            </FieldLabel>
            <PasswordInput
              id="confirm_password"
              autoComplete="new-password"
              aria-invalid={!!errors.confirm_password}
              {...register("confirm_password")}
            />
            <FieldError errors={[errors.confirm_password]} />
          </Field>

          {error && <FieldError>{error.message}</FieldError>}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Spinner />}
            {isLoading ? "Updating password..." : "Update password"}
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}

export { ResetPasswordForm };
