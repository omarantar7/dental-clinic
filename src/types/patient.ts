import z from "zod";
import { createRestQueryParser } from "@/lib/helpers/rest-query";

const PatientCreateSchema = z.object({
  full_name: z.string().min(2).max(100),
  phone_number: z.string().min(6),
  gender: z.enum(["MALE", "FEMALE"]),
  birth_date: z.coerce.date().nullable().optional(),
  address: z.string().nullable().optional(),
  medical_history: z.string().nullable().optional(),
  alergies: z.string().nullable().optional(),
});

const PatientUpdateSchema = PatientCreateSchema.partial();

type PatientCreateInput = z.infer<typeof PatientCreateSchema>;
type PatientUpdateInput = z.infer<typeof PatientUpdateSchema>;

const parsePatientListQuery = createRestQueryParser({
  allowedSortFields: ["id", "full_name", "phone_number", "created_at"] as const,
  allowedSearchFields: [
    "full_name",
    "phone_number",
    "address",
    "medical_history",
    "alergies",
  ] as const,
  defaultSortField: "created_at",
});

type PatientListItem = {
  id: string;
  full_name: string;
  phone_number: string;
  created_at: Date;
  total_balance: number;
  paid_balance: number;
  rest_balance: number;
};

type PatientDetail = {
  id: string;
  doctor_id: string;
  full_name: string;
  phone_number: string;
  birth_date: Date | null;
  gender: "MALE" | "FEMALE";
  address: string | null;
  medical_history: string | null;
  alergies: string | null;
  status: "ENABLED" | "DISABLED" | "DELETED";
  created_at: Date;
  updated_at: Date;
};

export {
  parsePatientListQuery,
  type PatientListItem,
  type PatientDetail,
  type PatientCreateInput,
  type PatientUpdateInput,
  PatientCreateSchema,
  PatientUpdateSchema,
};
