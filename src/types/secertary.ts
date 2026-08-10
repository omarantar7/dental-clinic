// types/secretary.ts
import z from "zod";
import { UserValidationSchema } from "@/types/user";

const SecretaryValidationSchema = z.object({
  user_id: z.string(),
  doctor_id: z.string(),
  hired_at: z.coerce.date().optional(),
  role_id: z.string().nullable().optional(),
});

type Secretary = z.infer<typeof SecretaryValidationSchema>;
type IdentifiableSecretary = Secretary & { id: string };

const RegisterSecretarySchema = UserValidationSchema.omit({
  role: true,
}).extend({
  doctor_id: z.string(),
  hired_at: z.coerce.date().optional(),
  role_id: z.string().nullable().optional(),
});

type RegisterSecretaryInput = z.infer<typeof RegisterSecretarySchema>;

export {
  SecretaryValidationSchema,
  RegisterSecretarySchema,
  type Secretary,
  type IdentifiableSecretary,
  type RegisterSecretaryInput,
};
