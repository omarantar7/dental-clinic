"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useForgotPasswordForm } from "@/features/auth/hooks/use-forgot-password-form";

function ForgotPasswordForm() {
  const { form, onSubmit, isLoading, error } = useForgotPasswordForm();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Heading level={1}>Reset your password</Heading>
        <Text>
          Enter your email and we&apos;ll send you a code to reset your
          password.
        </Text>
      </div>

      <form onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            <FieldError errors={[errors.email]} />
          </Field>

          {error && <FieldError>{error.message}</FieldError>}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Spinner />}
            {isLoading ? "Sending code..." : "Send code"}
          </Button>

          <Text>
            Remember your password? &nbsp;
            <Link
              href="/login"
              className="text-center text-primary hover:underline"
            >
              Back to login
            </Link>
          </Text>
        </FieldGroup>
      </form>
    </div>
  );
}

export { ForgotPasswordForm };
