// types/secretary.ts
import z from "zod";
import { UserValidationSchema } from "@/types/user";
import { createRestQueryParser } from "@/lib/helpers/rest-query";
import type { ParsedListQuery } from "@/lib/helpers/query-parser";
import type { PrismaClientOrTx } from "@/types/db";

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
  hired_at: z.coerce.date().nullable().optional(),
  role_id: z.string().nullable().optional(),
});

const SecretaryCreateSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(60),
  phone_number: z.string().min(1),
  full_name: z.string().min(3).max(30).nullable().optional(),
  address: z.string().nullable().optional(),
  hired_at: z.coerce.date().nullable().optional(),
  role_id: z.string().nullable().optional(),
});

const SecretaryUpdateSchema = z
  .object({
    role_id: z.string().nullable().optional(),
    phone_number: z.string().min(1).optional(),
    full_name: z.string().min(3).max(30).nullable().optional(),
    status: z.enum(["ENABLED", "DISABLED", "DELETED"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

type SecretaryUpdateInput = z.infer<typeof SecretaryUpdateSchema>;

const SecretaryUpdateProfileSchema = z
  .object({
    phone_number: z.string().min(1).optional(),
    full_name: z.string().min(3).max(30).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

type SecretaryUpdateProfileInput = z.infer<typeof SecretaryUpdateProfileSchema>;

type SecretaryCreateInput = z.infer<typeof SecretaryCreateSchema>;

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

type SecretaryResponse = SecretaryListItem;

const RegisterSecretarySchema = UserValidationSchema.omit({
  role: true,
}).extend({
  doctor_id: z.string(),
  hired_at: z.coerce.date().optional(),
  role_id: z.string().nullable().optional(),
});

type RegisterSecretaryInput = z.infer<typeof RegisterSecretarySchema>;

interface ISecretaryRepository {
  createSecretary(
    data: Secretary,
    tx?: PrismaClientOrTx,
  ): Promise<
    IdentifiableSecretary & Pick<SecretaryListItem, "created_at" | "updated_at">
  >;
  getSecretary(id: string, tx?: PrismaClientOrTx): Promise<IdentifiableSecretary>;
  getSecretaryByUserId(
    userId: string,
    tx?: PrismaClientOrTx,
  ): Promise<IdentifiableSecretary | null>;
  getSecretaryProfileByUserId(
    userId: string,
    tx?: PrismaClientOrTx,
  ): Promise<SecretaryListItem>;
  updateSecretaryProfileByUserId(
    userId: string,
    data: { phone_number?: string; full_name?: string | null },
    tx?: PrismaClientOrTx,
  ): Promise<SecretaryListItem>;
  listSecretariesByDoctorId(
    doctorId: string,
    query: ParsedListQuery,
    tx?: PrismaClientOrTx,
  ): Promise<{
    data: SecretaryListItem[];
    page: number;
    limit: number;
    total: number;
  }>;
  updateSecretary(
    id: string,
    doctorId: string,
    data: {
      role_id?: string | null;
      phone_number?: string;
      full_name?: string | null;
      status?: "ENABLED" | "DISABLED" | "DELETED";
    },
    tx?: PrismaClientOrTx,
  ): Promise<SecretaryListItem>;
  deleteSecretary(
    id: string,
    doctorId: string,
    tx?: PrismaClientOrTx,
  ): Promise<void>;
}

export {
  parseSecretaryListQuery,
  SecretaryValidationSchema,
  SecretaryCreateSchema,
  SecretaryUpdateSchema,
  SecretaryUpdateProfileSchema,
  RegisterSecretarySchema,
  type Secretary,
  type IdentifiableSecretary,
  type SecretaryListItem,
  type SecretaryResponse,
  type SecretaryCreateInput,
  type SecretaryUpdateInput,
  type SecretaryUpdateProfileInput,
  type RegisterSecretaryInput,
  type ISecretaryRepository,
};
