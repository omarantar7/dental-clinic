import { escapeHtml } from "@/utils/escape-html";
import type { EmailTemplate } from "./types";

export function secretaryInvitationTemplate(input: {
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
    subject: "You have been invited as a secretary",
    html: `<p>${greeting}</p><p>You have been invited to manage a dental clinic as a secretary.</p><p>Sign in at: <a href="${loginUrl}">${loginUrl}</a></p><p>Your login email is: <strong>${escapeHtml(input.email)}</strong></p><p>Your temporary password is: <strong>${escapeHtml(input.temporaryPassword)}</strong></p><p>Please sign in and change your password as soon as possible.</p>`,
  };
}
