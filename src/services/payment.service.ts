import prisma from "@/lib/db";
import { PaymentRepository } from "@/repositories/payment.repository";
import { SessionRepository } from "@/repositories/session.repository";
import type {
  PaymentCreateInput,
  PaymentListQuery,
} from "@/types/payment";

export class PaymentService {
  static async createForSession(
    sessionId: string,
    doctorId: string,
    data: PaymentCreateInput,
  ) {
    return prisma.$transaction(async (tx) => {
      const payment = await PaymentRepository.createForSession(
        sessionId,
        doctorId,
        data,
        tx,
      );
      await SessionRepository.updatePaymentStatus(
        sessionId,
        doctorId,
        tx,
      );
      return payment;
    });
  }

  static async listBySessionId(
    sessionId: string,
    doctorId: string,
    query: PaymentListQuery,
  ) {
    return PaymentRepository.listBySessionId(sessionId, doctorId, query);
  }


}