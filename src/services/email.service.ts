import { Resend } from "resend";
import config from "@/config";
import env from "@/config/env";
import { doctorInvitationTemplate } from "@/services/email-templates/doctor-invitation.template";
import {
  passwordResetTemplate,
} from "@/services/email-templates/password-reset.template";
import { secretaryInvitationTemplate } from "@/services/email-templates/secretary-invitation.template";
import type { EmailTemplate } from "@/services/email-templates/types";

// Created on first use: `new Resend()` throws without an API key, and
// `next build` imports this module without the runtime env.
let resend: Resend | undefined;

function getResend(): Resend {
  resend ??= new Resend(env.RESEND_API_KEY);
  return resend;
}

export class EmailService {
  static async sendEmail(to: string, template: EmailTemplate): Promise<void> {
    const { error } = await getResend().emails.send({
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

  static async sendSecretaryInvitation(input: {
    email: string;
    fullName: string | null;
    temporaryPassword: string;
  }): Promise<void> {
    await this.sendEmail(
      input.email,
      secretaryInvitationTemplate({ ...input, loginUrl: this.loginUrl() }),
    );
  }

  static async sendDoctorInvitation(input: {
    email: string;
    fullName: string | null;
    temporaryPassword: string;
  }): Promise<void> {
    await this.sendEmail(
      input.email,
      doctorInvitationTemplate({ ...input, loginUrl: this.loginUrl() }),
    );
  }

  private static loginUrl(): string {
    return new URL("/login", config.app.url).toString();
  }
}
