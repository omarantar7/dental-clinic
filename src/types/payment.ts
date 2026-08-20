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

export {
  parsePaymentListQuery,
  type Payment,
  type PaymentListQuery,
};
