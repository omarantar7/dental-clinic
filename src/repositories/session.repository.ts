import prisma from "@/lib/db";
import { Prisma } from "@/app/generated/prisma/client";
import { NotFoundException } from "@/exceptions/http/NotFoundException";
import type {
  PatientBalance,
  RawSessionWithPayments,
  Session,
  SessionDetail,
  SessionWithPayments,
} from "@/types/session";
import { ParsedListQuery } from "@/lib/helpers/query-parser";

type PrismaClientOrTx = typeof prisma | Prisma.TransactionClient;

export class SessionRepository {
  static hasOverlap(
    startA: Date,
    endA: Date,
    startB: Date,
    endB: Date,
  ): boolean {
    return startA < endB && endA > startB;
  }

  private static computePaymentStatus(
    totalAmount: number,
    amountPaid: number,
  ): Session["payment_status"] {
    if (amountPaid <= 0) return "SCHEDULED";
    if (amountPaid >= totalAmount) return "COMPLETED";
    return "INPROGRESS";
  }

  private static toSession(session: RawSessionWithPayments): Session {
    const amountPaid = session.payments.reduce((sum, payment) => sum + payment.amount, 0);
    const amountOwed = session.total_amount - amountPaid;

    return {
      id: session.id,
      patient_id: session.patient_id,
      session_name: session.session_name,
      session_start_date: session.session_start_date,
      session_end_date: session.session_end_date,
      total_amount: session.total_amount,
      status: session.status as Session["status"],
      payment_status: this.computePaymentStatus(session.total_amount, amountPaid),
      diagnosis: session.diagnosis,
      tooth_numbers: session.tooth_numbers,
      description: session.description,
      extra_notes: session.extra_notes,
      amount_paid: amountPaid,
      amount_owed: amountOwed,
      created_at: session.created_at,
      updated_at: session.updated_at,
    };
  }

  private static toSessionWithPayments(
    session: RawSessionWithPayments,
  ): SessionWithPayments {
    return {
      ...this.toSession(session),
      payments: session.payments,
    };
  }

  static async getSessionDetail(
    id: string,
    doctorId: string,
    tx: PrismaClientOrTx = prisma,
  ): Promise<SessionDetail> {
    const session = await tx.session.findFirst({
      where: {
        id,
        doctor_id: doctorId,
        status: { not: "DELETED" },
      },
      include: {
        patient: true,
        payments: true,
      },
    });

    if (!session) {
      throw new NotFoundException("session not found");
    }

    const previousSessions = await tx.session.findMany({
      where: {
        patient_id: session.patient_id,
        doctor_id: doctorId,
        status: { not: "DELETED" },
        id: { not: id },
      },
      include: { payments: true },
      orderBy: { session_start_date: "desc" },
    });

    return {
      ...this.toSessionWithPayments({
        ...session,
        payments: session.payments,
      }),
      patient: session.patient,
      previous_sessions: previousSessions.map((s) =>
        this.toSessionWithPayments({ ...s, payments: s.payments }),
      ),
    };
  }

  static async listSessions(
    doctorId: string,
    query: ParsedListQuery,
    tx: PrismaClientOrTx = prisma,
  ): Promise<{ data: SessionWithPayments[]; page: number; limit: number; total: number }> {
    const { page, limit, sortBy, sortOrder, where: searchWhere } = query;

    const where: Prisma.SessionWhereInput = {
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
      data: sessions.map((session) =>
        this.toSessionWithPayments({ ...session, payments: session.payments }),
      ),
      page,
      limit,
      total,
    };
  }



  static async listByPatientId(
    patientId: string,
    doctorId: string,
    query: ParsedListQuery,
    tx: PrismaClientOrTx = prisma,
  ): Promise<{ data: SessionWithPayments[]; page: number; limit: number; total: number }> {
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
      data: sessions.map((session) =>
        this.toSessionWithPayments({ ...session, payments: session.payments }),
      ),
      page,
      limit,
      total,
    };
  }

  static async getPatientBalance(
    patientId: string,
    doctorId: string,
    tx: PrismaClientOrTx = prisma,
  ): Promise<PatientBalance> {
    const sessions = await tx.session.findMany({
      where: {
        patient_id: patientId,
        doctor_id: doctorId,
        status: { not: "DELETED" },
      },
      select: {
        total_amount: true,
        payments: { select: { amount: true } },
      },
    });

    const totalBilled = sessions.reduce((sum, session) => sum + session.total_amount, 0);
    const totalPaid = sessions.reduce(
      (sum, session) =>
        sum + session.payments.reduce((paymentSum, payment) => paymentSum + payment.amount, 0),
      0,
    );

    return {
      patient_id: patientId,
      total_billed: totalBilled,
      total_paid: totalPaid,
      total_owed: totalBilled - totalPaid,
    };
  }
}
