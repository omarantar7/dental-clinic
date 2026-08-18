import { createRestQueryParser } from "@/lib/helpers/rest-query";

type SessionWithPayments = {
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
  payments: {
    id: string;
    session_id: string;
    amount: number;
    payment_date: Date | null;
    notes: string | null;
    created_at: Date;
    updated_at: Date;
  }[];
};

const parseSessionListQuery = createRestQueryParser({
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
});

type RawSessionWithPayments = {
  id: string;
  patient_id: string;
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
  payments: {
    id: string;
    session_id: string;
    amount: number;
    payment_date: Date | null;
    notes: string | null;
    created_at: Date;
    updated_at: Date;
  }[];
};

export {
  parseSessionListQuery,
  type SessionWithPayments,
  type RawSessionWithPayments,
};
