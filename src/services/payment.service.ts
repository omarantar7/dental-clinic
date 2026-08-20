import { PaymentRepository } from "@/repositories/payment.repository";
import type { PaymentListQuery } from "@/types/payment";

export class PaymentService {
  static async listBySessionId(
    sessionId: string,
    doctorId: string,
    query: PaymentListQuery,
  ) {
    return PaymentRepository.listBySessionId(sessionId, doctorId, query);
  }
}