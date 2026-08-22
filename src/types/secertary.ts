// types/secretary.ts
import z from "zod";
import { UserValidationSchema } from "@/types/user";
import { createRestQueryParser } from "@/lib/helpers/rest-query";

const parseSecretaryListQuery = createRestQueryParser({
  allowedSortFields: [
    "id",
    "email",
    "phone_number",
    "hired_at",
    "full_name",
    "created_at",
    "updated_at",
  ] as const,
  allowedSearchFields: ["email", "phone_number", "status", "full_name"] as const,
  defaultSortField: "created_at",
});

const SecretaryValidationSchema = z.object({
  user_id: z.string(),
  doctor_id: z.string(),
  hired_at: z.coerce.date().optional(),
  role_id: z.string().nullable().optional(),
});

type Secretary = z.infer<typeof SecretaryValidationSchema>;
type IdentifiableSecretary = Secretary & { id: string };

type SecretaryListItem = {
  id: string;
  user_id: string;
  role_id: string | null;
  role_name: string | null;
  email: string;
  phone_number: string;
  full_name: string | null;
  status: "ENABLED" | "DISABLED" | "DELETED";
  hired_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

const RegisterSecretarySchema = UserValidationSchema.omit({
  role: true,
}).extend({
  doctor_id: z.string(),
  hired_at: z.coerce.date().optional(),
  role_id: z.string().nullable().optional(),
});

type RegisterSecretaryInput = z.infer<typeof RegisterSecretarySchema>;

export {
  parseSecretaryListQuery,
  SecretaryValidationSchema,
  RegisterSecretarySchema,
  type Secretary,
  type IdentifiableSecretary,
  type SecretaryListItem,
  type RegisterSecretaryInput,
};
