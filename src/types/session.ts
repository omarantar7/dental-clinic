import z from "zod";
import { createRestQueryParser } from "@/lib/helpers/rest-query";
import { Payment } from "./payment";

const SessionStatusSchema = z.enum(["UNCOMPLETED", "COMPLETED", "DELETED"]);
const PaymentStatusSchema = z.enum(["SCHEDULED", "INPROGRESS", "COMPLETED"]);

const SessionCreateSchema = z
  .object({
    patient_id: z.string().min(1),
    session_name: z.string().min(1),
    session_start_date: z.coerce.date(),
    session_end_date: z.coerce.date(),
    total_amount: z.number().min(0),
    diagnosis: z.string().nullable().optional(),
    tooth_numbers: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    extra_notes: z.string().nullable().optional(),
  })
  .refine(
    (data) => data.session_end_date > data.session_start_date,
    {
      message: "session_end_date must be after session_start_date",
      path: ["session_end_date"],
    },
  );

const SessionUpdateSchema = z
  .object({
    session_name: z.string().min(1).optional(),
    session_start_date: z.coerce.date().optional(),
    session_end_date: z.coerce.date().optional(),
    total_amount: z.number().min(0).optional(),
    status: SessionStatusSchema.optional(),
    diagnosis: z.string().nullable().optional(),
    tooth_numbers: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    extra_notes: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      if (
        data.session_start_date !== undefined &&
        data.session_end_date !== undefined
      ) {
        return data.session_end_date > data.session_start_date;
      }
      return true;
    },
    {
      message: "session_end_date must be after session_start_date",
      path: ["session_end_date"],
    },
  );


type Session = {
  id: string;
  patient_id: string;
  session_name: string;
  session_start_date: Date | null;
  session_end_date: Date | null;
  total_amount: number;
  status: "UNCOMPLETED" | "COMPLETED" | "DELETED";
  payment_status: "SCHEDULED" | "INPROGRESS" | "COMPLETED";
  diagnosis: string | null;
  tooth_numbers: string | null;
  description: string | null;
  extra_notes: string | null;
  amount_paid: number;
  amount_owed: number;
  created_at: Date;
  updated_at: Date;
};

type SessionWithPayments = Session & {
  payments: Payment[];
};

type SessionDetail = SessionWithPayments & {
  patient: {
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
  previous_sessions: SessionWithPayments[];
};

const parseSessionListQuery = (raw: Record<string, any>) => {
  const baseQuery = createRestQueryParser({
    allowedSortFields: [
      "id",
      "session_start_date",
      "session_end_date",
      "total_amount",
      "created_at",
    ] as const,
    allowedSearchFields: [
      "session_name",
      "diagnosis",
      "tooth_numbers",
      "description",
      "extra_notes",
    ] as const,
    defaultSortField: "session_start_date",
  })(raw);

  const where: Record<string, any> = { ...baseQuery.where };

  if (raw.patient_id) {
    where.patient_id = String(raw.patient_id);
  }

  if (raw.status) {
    const nextStatus = String(raw.status);
    if (SessionStatusSchema.safeParse(nextStatus).success) {
      where.status = nextStatus;
    }
  }

  if (raw.from || raw.to) {
    where.session_start_date = {};
    if (raw.from) {
      where.session_start_date.gte = new Date(String(raw.from));
    }
    if (raw.to) {
      const endOfDay = new Date(String(raw.to));
      endOfDay.setUTCHours(23, 59, 59, 999);
      where.session_start_date.lte = endOfDay;
    }
  }

  return { ...baseQuery, where };
};

type RawSessionWithPayments = {
  id: string;
  patient_id: string;
  patient?: {
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
  session_name: string;
  session_start_date: Date | null;
  session_end_date: Date | null;
  total_amount: number;
  status: string;
  diagnosis: string | null;
  tooth_numbers: string | null;
  description: string | null;
  extra_notes: string | null;
  created_at: Date;
  updated_at: Date;
  payments: Payment[];
};

type PatientBalance = {
  patient_id: string;
  total_billed: number;
  total_paid: number;
  total_owed: number;
};

type SessionCreateInput = z.infer<typeof SessionCreateSchema>;
type SessionUpdateInput = z.infer<typeof SessionUpdateSchema>;

export {
  parseSessionListQuery,
  SessionCreateSchema,
  SessionUpdateSchema,
  PaymentStatusSchema,
  SessionStatusSchema,
  type Session,
  type SessionWithPayments,
  type SessionDetail,
  type RawSessionWithPayments,
  type PatientBalance,
  type Payment,
  type SessionCreateInput,
  type SessionUpdateInput,
};
