import type { EmailTemplate } from "./types";

export type { EmailTemplate } from "./types";

export function passwordResetTemplate(
  otp: string,
  expirationMinutes: number,
): EmailTemplate {
  return {
    subject: "Your password reset code",
    html: `<p>Your password reset code is:</p><h2>${otp}</h2><p>This code expires in ${expirationMinutes} minutes.</p>`,
  };
}
