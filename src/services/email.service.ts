import { Resend } from "resend";
import env from "@/config/env";
import {
  passwordResetTemplate,
} from "@/services/email-templates/password-reset.template";
import type { EmailTemplate } from "@/services/email-templates/types";

const resend = new Resend(env.RESEND_API_KEY);

export class EmailService {
  static async sendEmail(to: string, template: EmailTemplate): Promise<void> {
    const { error } = await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to,
      subject: template.subject,
      html: template.html,
    });

    if (error) {
      throw new Error("Failed to send email", { cause: error });
    }
  }

  static async sendPasswordResetOtp(to: string, otp: string): Promise<void> {
    await this.sendEmail(
      to,
      passwordResetTemplate(otp, env.OTP_EXPIRATION_MINUTES ?? 10),
    );
  }
}
