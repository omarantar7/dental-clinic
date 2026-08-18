import { Resend } from "resend";
import env from "@/config/env";

const resend = new Resend(env.RESEND_API_KEY);

export class EmailService {
  static async sendPasswordResetOtp(to: string, otp: string): Promise<void> {
    const { error } = await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to,
      subject: "Your password reset code",
      html: `<p>Your password reset code is:</p><h2>${otp}</h2><p>This code expires in ${env.OTP_EXPIRATION_MINUTES ?? 10} minutes.</p>`,
    });

    if (error) {
      throw new Error("Failed to send password reset email", { cause: error });
    }
  }
}
