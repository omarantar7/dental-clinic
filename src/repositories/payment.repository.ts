import prisma from "@/lib/db";
import { Prisma } from "@/app/generated/prisma/client";
import { BadRequestException } from "@/exceptions/http/BadRequestException";
import { NotFoundException } from "@/exceptions/http/NotFoundException";
import type {
  Payment,
  PaymentCreateInput,
  PaymentListQuery,
  PaymentUpdateInput,
} from "@/types/payment";

type PrismaClientOrTx = typeof prisma | Prisma.TransactionClient;

export class PaymentRepository {
  static async ensureAmountWithinSessionBalance(
    sessionId: string,
    doctorId: string,
    amount: number,
    excludedPaymentId?: string,
    tx: PrismaClientOrTx = prisma,
  ): Promise<void> {
    const session = await tx.session.findFirst({
      where: {
        id: sessionId,
        doctor_id: doctorId,
        status: { not: "DELETED" },
      },
      select: {
        total_amount: true,
        payments: {
          where: excludedPaymentId ? { id: { not: excludedPaymentId } } : {},
          select: { amount: true },
        },
      },
    });

    if (!session) {
      throw new NotFoundException("session not found");
    }

    const amountPaid = session.payments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    );
    const amountOwed = Number(session.total_amount) - amountPaid;

    if (amount > amountOwed) {
      throw new BadRequestException(
        `Payment amount cannot exceed the session balance of ${amountOwed}.`,
      );
    }
  }

  static async createForSession(
    sessionId: string,
    doctorId: string,
    data: PaymentCreateInput,
    tx: PrismaClientOrTx = prisma,
  ): Promise<Payment> {
    await this.ensureAmountWithinSessionBalance(
      sessionId,
      doctorId,
      data.amount,
      undefined,
      tx,
    );

    return tx.payment.create({
      data: {
        session_id: sessionId,
        amount: data.amount,
        payment_date: data.payment_date,
        notes: data.notes ?? null,
      },
    });
  }

  static async updatePayment(
    paymentId: string,
    doctorId: string,
    data: PaymentUpdateInput,
    tx: PrismaClientOrTx = prisma,
  ): Promise<Payment> {
    const payment = await tx.payment.findFirst({
      where: {
        id: paymentId,
        session: {
          doctor_id: doctorId,
          status: { not: "DELETED" },
        },
      },
      select: { session_id: true },
    });

    if (!payment) {
      throw new NotFoundException("payment not found");
    }

    if (data.amount !== undefined) {
      await this.ensureAmountWithinSessionBalance(
        payment.session_id,
        doctorId,
        data.amount,
        paymentId,
        tx,
      );
    }

    return tx.payment.update({
      where: { id: paymentId },
      data: {
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.payment_date !== undefined && {
          payment_date: data.payment_date,
        }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });
  }

  static async listBySessionId(
    sessionId: string,
    doctorId: string,
    query: PaymentListQuery,
  ): Promise<{
    data: Payment[];
    page: number;
    limit: number;
    total: number;
  }> {
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        doctor_id: doctorId,
        status: { not: "DELETED" },
      },
      select: { id: true },
    });

    if (!session) {
      throw new NotFoundException("session not found");
    }

    const { page, limit, sortBy, sortOrder, where: searchWhere } = query;
    const where: Prisma.PaymentWhereInput = {
      session_id: sessionId,
      ...searchWhere,
    };

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);

    return { data: payments, page, limit, total };
  }
}
