import prisma from "@/lib/db";
import { Prisma } from "@/app/generated/prisma/client";
import type {
  RawSessionWithPayments,
  SessionWithPayments,
} from "@/types/session";
import { ParsedListQuery } from "@/lib/helpers/query-parser";

type PrismaClientOrTx = typeof prisma | Prisma.TransactionClient;

export class SessionRepository {
  private static toSessionWithPayments(
    session: RawSessionWithPayments,
  ): SessionWithPayments {
    const amountPaid = session.payments.reduce((sum, p) => sum + p.amount, 0);
    const amountOwed = session.total_amount - amountPaid;

    const paymentStatus: SessionWithPayments["payment_status"] =
      amountPaid <= 0
        ? "SCHEDULED"
        : amountPaid >= session.total_amount
          ? "COMPLETED"
          : "INPROGRESS";

    return {
      id: session.id,
      patient_id: session.patient_id,
      session_name: session.session_name,
      session_start_date: session.session_start_date,
      session_end_date: session.session_end_date,
      total_amount: session.total_amount,
      status: session.status as SessionWithPayments["status"],
      payment_status: paymentStatus,
      diagnosis: session.diagnosis,
      tooth_numbers: session.tooth_numbers,
      description: session.description,
      extra_notes: session.extra_notes,
      amount_paid: amountPaid,
      amount_owed: amountOwed,
      created_at: session.created_at,
      updated_at: session.updated_at,
      payments: session.payments,
    };
  }

  /**
   * Scoped by BOTH patientId and doctorId — doctorId is defense in
   * depth in case a patientId from another tenant ever reaches this
   * method directly (callers should already verify patient ownership
   * via PatientRepository first).
   */
  static async listByPatientId(
    patientId: string,
    doctorId: string,
    query: ParsedListQuery,
    tx: PrismaClientOrTx = prisma,
  ): Promise<{
    data: SessionWithPayments[];
    page: number;
    limit: number;
    total: number;
  }> {
    const { page, limit, sortBy, sortOrder, where: searchWhere } = query;

    const where: Prisma.SessionWhereInput = {
      patient_id: patientId,
      doctor_id: doctorId,
      status: { not: "DELETED" },
      ...searchWhere,
    };

    const [sessions, total] = await Promise.all([
      tx.session.findMany({
        where,
        include: { payments: true },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      tx.session.count({ where }),
    ]);

    return {
      data: sessions.map((s) => this.toSessionWithPayments(s)),
      page,
      limit,
      total,
    };
  }
}
