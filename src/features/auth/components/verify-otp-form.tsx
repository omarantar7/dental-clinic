"use client";

import { Controller } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Heading } from "@/components/ui/heading";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useVerifyOtpForm } from "@/features/auth/hooks/use-verify-otp-form";

function VerifyOtpForm({ email }: { email: string }) {
  const { form, onSubmit, isLoading, error } = useVerifyOtpForm(email);
  const {
    control,
    formState: { errors },
  } = form;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Heading level={1}>Enter the code</Heading>
        <Text>
          We sent a code to{" "}
          <span className="font-medium text-foreground">{email}</span>.
        </Text>
      </div>

      <form onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <Field data-invalid={!!errors.otp_code}>
            <FieldLabel htmlFor="otp_code">OTP Code</FieldLabel>
            <Controller
              control={control}
              name="otp_code"
              render={({ field }) => (
                <InputOTP
                  id="otp_code"
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS}
                  inputMode="numeric"
                  aria-invalid={!!errors.otp_code}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="size-10 md:size-14  text-lg" />
                    <InputOTPSlot index={1} className="size-10 md:size-14  text-lg" />
                    <InputOTPSlot index={2} className="size-10 md:size-14  text-lg" />
                    <InputOTPSlot index={3} className="size-10 md:size-14  text-lg" />
                    <InputOTPSlot index={4} className="size-10 md:size-14  text-lg" />
                    <InputOTPSlot index={5} className="size-10 md:size-14  text-lg" />
                  </InputOTPGroup>
                </InputOTP>
              )}
            />
            <FieldError errors={[errors.otp_code]} />
          </Field>

          {error && <FieldError>{error.message}</FieldError>}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Spinner />}
            {isLoading ? "Verifying..." : "Verify code"}
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}

export { VerifyOtpForm };
