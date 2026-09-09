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
import { PasswordInput } from "@/components/ui/password-input";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useLoginForm } from "@/features/auth/hooks/use-login-form";

function LoginForm() {
  const { form, onSubmit, isLoading, error } = useLoginForm();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Heading level={1}>Welcome Back</Heading>
        <Text>Sign in to continue.</Text>
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

          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <FieldError errors={[errors.password]} />
          </Field>

          {error && <FieldError>{error.message}</FieldError>}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Spinner />}
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>

          <Text>
            Don&apos;t remember your password? &nbsp;
            <Link
              href="/forgot-password"
              className="text-center text-primary hover:underline"
            >
              Forgot password
            </Link>
          </Text>
        </FieldGroup>
      </form>
    </div>
  );
}

export { LoginForm };
