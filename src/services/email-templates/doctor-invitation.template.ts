import { escapeHtml } from "@/utils/escape-html";
import type { EmailTemplate } from "./types";

export function doctorInvitationTemplate(input: {
  fullName: string | null;
  email: string;
  temporaryPassword: string;
  loginUrl: string;
}): EmailTemplate {
  const greeting = input.fullName
    ? `Hello ${escapeHtml(input.fullName)},`
    : "Hello,";
  const loginUrl = escapeHtml(input.loginUrl);

  return {
    subject: "Your dental clinic account is ready",
    html: `<p>${greeting}</p><p>An account has been created for you to manage your dental clinic.</p><p>Sign in at: <a href="${loginUrl}">${loginUrl}</a></p><p>Your login email is: <strong>${escapeHtml(input.email)}</strong></p><p>Your temporary password is: <strong>${escapeHtml(input.temporaryPassword)}</strong></p><p>Please sign in and change your password as soon as possible.</p>`,
  };
}
