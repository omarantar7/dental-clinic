import prisma from "@/lib/db";
import { Prisma } from "@/app/generated/prisma/client";
import { NotFoundException } from "@/exceptions/http/NotFoundException";
import type { Payment, PaymentListQuery } from "@/types/payment";

export class PaymentRepository {
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