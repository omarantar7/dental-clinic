import type { Session } from "@/types/session";

export function computePaymentStatus(
  totalAmount: number,
  amountPaid: number,
): Session["payment_status"] {
  if (amountPaid <= 0) return "SCHEDULED";
  if (amountPaid >= totalAmount) return "COMPLETED";
  return "INPROGRESS";
}
