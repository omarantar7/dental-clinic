import z from "zod";

const RequestPasswordResetSchema = z.object({
  email: z.email(),
});

const VerifyOtpSchema = z.object({
  email: z.email(),
  otp_code: z.string().length(4),
});

const ConfirmNewPasswordSchema = z.object({
  reset_id: z.string(),
  new_password: z.string().min(8).max(60),
});

type RequestPasswordResetInput = z.infer<typeof RequestPasswordResetSchema>;

type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;

type ConfirmNewPasswordInput = z.infer<typeof ConfirmNewPasswordSchema>;

export {
  RequestPasswordResetSchema,
  VerifyOtpSchema,
  type RequestPasswordResetInput,
  type VerifyOtpInput,
  ConfirmNewPasswordSchema,
  type ConfirmNewPasswordInput,
};
