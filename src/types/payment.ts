import z from "zod";
import { createRestQueryParser } from "@/lib/helpers/rest-query";

type Payment = {
  id: string;
  session_id: string;
  amount: number;
  payment_date: Date | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
};

const PaymentCreateSchema = z.object({
  amount: z.number().min(0),
  payment_date: z.coerce.date(),
  notes: z.string().optional(),
});

const PaymentUpdateSchema = z.object({
  amount: z.number().min(0).optional(),
  payment_date: z.coerce.date().optional(),
  notes: z.string().nullable().optional(),
});

const parsePaymentListQuery = createRestQueryParser({
  allowedSortFields: [
    "payment_date",
    "amount",
    "created_at",
  ] as const,
  allowedSearchFields: ["notes"] as const,
  defaultSortField: "payment_date",
});

type PaymentListQuery = ReturnType<typeof parsePaymentListQuery>;
type PaymentCreateInput = z.infer<typeof PaymentCreateSchema>;
type PaymentUpdateInput = z.infer<typeof PaymentUpdateSchema>;

export {
  PaymentCreateSchema,
  PaymentUpdateSchema,
  parsePaymentListQuery,
  type Payment,
  type PaymentCreateInput,
  type PaymentListQuery,
  type PaymentUpdateInput,
};
