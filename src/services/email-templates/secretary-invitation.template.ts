import type { EmailTemplate } from "./types";

export function secretaryInvitationTemplate(input: {
  fullName: string | null;
  email: string;
  temporaryPassword: string;
}): EmailTemplate {
  const greeting = input.fullName ? `Hello ${input.fullName},` : "Hello,";

  return {
    subject: "You have been invited as a secretary",
    html: `<p>${greeting}</p><p>You have been invited to manage a dental clinic as a secretary.</p><p>Your login email is: <strong>${input.email}</strong></p><p>Your temporary password is: <strong>${input.temporaryPassword}</strong></p><p>Please sign in and change your password as soon as possible.</p>`,
  };
}
