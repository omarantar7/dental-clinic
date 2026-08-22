import prisma from "@/lib/db";
import { Prisma } from "@/app/generated/prisma/client";
import { NotFoundException } from "@/exceptions/http/NotFoundException";
import type {
  PatientBalance,
  RawSessionWithPayments,
  Session,
  SessionCreateInput,
  SessionDetail,
  SessionUpdateInput,
  SessionWithPayments,
} from "@/types/session";
import { ParsedListQuery } from "@/lib/helpers/query-parser";
import { ConflictException } from "@/exceptions/http/ConflictException";

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
    const amountPaid = session.payments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );
    const amountOwed = session.total_amount - amountPaid;

    return {
      id: session.id,
      patient_id: session.patient_id,
      session_name: session.session_name,
      session_start_date: session.session_start_date,
      session_end_date: session.session_end_date,
      total_amount: session.total_amount,
      status: session.status as Session["status"],
      payment_status: this.computePaymentStatus(
        session.total_amount,
        amountPaid,
      ),
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

  private static async ensureNoTimeConflict(
    doctorId: string,
    startDate: Date,
    endDate: Date,
    excludedSessionId?: string,
    tx: PrismaClientOrTx = prisma,
  ): Promise<void> {
    const sessions = await tx.session.findMany({
      where: {
        doctor_id: doctorId,
        status: { not: "DELETED" },
      },
      select: {
        id: true,
        session_start_date: true,
        session_end_date: true,
      },
    });

    const hasConflict = sessions.some((session) => {
      if (excludedSessionId && session.id === excludedSessionId) return false;
      if (!session.session_start_date || !session.session_end_date)
        return false;
      return this.hasOverlap(
        startDate,
        endDate,
        new Date(session.session_start_date),
        new Date(session.session_end_date),
      );
    });

    if (hasConflict) {
      throw new ConflictException(
        "This time slot overlaps an existing appointment.",
        { code: "SESSION_TIME_CONFLICT" },
      );
    }
  }

  static async getSessionById(
    id: string,
    doctorId: string,
    tx: PrismaClientOrTx = prisma,
  ): Promise<SessionWithPayments> {
    const session = await tx.session.findFirst({
      where: {
        id,
        doctor_id: doctorId,
        status: { not: "DELETED" },
      },
      include: { payments: true },
    });

    if (!session) {
      throw new NotFoundException("session not found");
    }

    return this.toSessionWithPayments({
      ...session,
      payments: session.payments,
    });
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
      orderBy: { created_at: "desc" },
      take: 3,
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
  ): Promise<{
    data: SessionWithPayments[];
    page: number;
    limit: number;
    total: number;
  }> {
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

  static async listCalendarSessions(
    doctorId: string,
    from: Date,
    toExclusive: Date,
    tx: PrismaClientOrTx = prisma,
  ) {
    return tx.session.findMany({
      where: {
        doctor_id: doctorId,
        status: { not: "DELETED" },
        session_start_date: { lt: toExclusive },
        session_end_date: { gt: from },
      },
      select: {
        id: true,
        patient_id: true,
        session_name: true,
        session_start_date: true,
        session_end_date: true,
        total_amount: true,
        status: true,
        patient: { select: { full_name: true } },
        payments: { select: { amount: true } },
      },
      orderBy: { session_start_date: "asc" },
    });
  }

  static async createSession(
    doctorId: string,
    data: SessionCreateInput,
    tx: PrismaClientOrTx = prisma,
  ): Promise<Session> {
    const patient = await tx.patient.findFirst({
      where: {
        id: data.patient_id,
        doctor_id: doctorId,
        status: { not: "DELETED" },
      },
      select: { id: true },
    });

    if (!patient) {
      throw new NotFoundException("patient not found");
    }

    const startDate = new Date(data.session_start_date);
    const endDate = new Date(data.session_end_date);
    await this.ensureNoTimeConflict(
      doctorId,
      startDate,
      endDate,
      undefined,
      tx,
    );

    const session = await tx.session.create({
      data: {
        doctor_id: doctorId,
        patient_id: data.patient_id,
        session_name: data.session_name,
        session_start_date: startDate,
        session_end_date: endDate,
        total_amount: data.total_amount,
        diagnosis: data.diagnosis ?? null,
        tooth_numbers: data.tooth_numbers ?? null,
        description: data.description ?? null,
        extra_notes: data.extra_notes ?? null,
      },
    });

    return this.toSession({
      ...session,
      payments: [],
    });
  }

  static async updateSession(
    id: string,
    doctorId: string,
    data: SessionUpdateInput,
    tx: PrismaClientOrTx = prisma,
  ): Promise<SessionWithPayments> {
    const existing = await this.getSessionById(id, doctorId, tx);

    const nextStart =
      data.session_start_date !== undefined
        ? new Date(data.session_start_date)
        : existing.session_start_date;
    const nextEnd =
      data.session_end_date !== undefined
        ? new Date(data.session_end_date)
        : existing.session_end_date;

    if (nextStart && nextEnd) {
      await this.ensureNoTimeConflict(doctorId, nextStart, nextEnd, id, tx);
    }

    const updatedSession = await tx.session.update({
      where: { id },
      data: {
        ...data,
        ...(data.session_start_date !== undefined && {
          session_start_date: nextStart,
        }),
        ...(data.session_end_date !== undefined && {
          session_end_date: nextEnd,
        }),
      },
      include: { payments: true },
    });

    return this.toSessionWithPayments(updatedSession);
  }

  static async softDeleteSession(
    id: string,
    doctorId: string,
    tx: PrismaClientOrTx = prisma,
  ): Promise<void> {
    await this.getSessionById(id, doctorId, tx);

    await tx.session.update({
      where: { id },
      data: { status: "DELETED", updated_at: new Date() },
    });
  }

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

    const totalBilled = sessions.reduce(
      (sum, session) => sum + session.total_amount,
      0,
    );
    const totalPaid = sessions.reduce(
      (sum, session) =>
        sum +
        session.payments.reduce(
          (paymentSum, payment) => paymentSum + payment.amount,
          0,
        ),
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
