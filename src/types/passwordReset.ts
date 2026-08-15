import z from "zod";

const RequestPasswordResetSchema = z.object({
  email: z.email(),
});

const VerifyOtpSchema = z.object({
  email: z.email(),
  otp_code: z.string().length(4),
});

type RequestPasswordResetInput = z.infer<typeof RequestPasswordResetSchema>;

type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;

export {
  RequestPasswordResetSchema,
  VerifyOtpSchema,
  type RequestPasswordResetInput,
  type VerifyOtpInput,
};
