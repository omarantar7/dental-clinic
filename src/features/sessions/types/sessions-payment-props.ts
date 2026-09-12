import { Payment } from "@/types/payment";

interface SessionPaymentsProps {
  sessionId: string;
  payments: Payment[];
  remainingBalance: number;
  onSuccess: () => void;
}
interface PaymentFormDialogProps {
  mode: "create" | "edit";
  sessionId: string;
  payment?: Payment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface UsePaymentFormOptions {
  mode: "create" | "edit";
  sessionId: string;
  payment?: Payment;
  onSuccess: () => void;
}

export type {
  SessionPaymentsProps,
  PaymentFormDialogProps,
  UsePaymentFormOptions,
};
