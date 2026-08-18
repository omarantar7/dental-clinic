import { NotFoundException } from "@/exceptions/http/NotFoundException";
import prisma from "@/lib/db";
import { Prisma } from "@/app/generated/prisma/client";
import type {
  PatientCreateInput,
  PatientListItem,
  PatientUpdateInput,
} from "@/types/patient";

type PrismaClientOrTx = typeof prisma | Prisma.TransactionClient;

interface ParsedPatientListQuery {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  where: Record<string, any>;
}

export class PatientRepository {
  static async getPatient(
    id: string,
    doctorId: string,
    tx: PrismaClientOrTx = prisma,
  ) {
    const patient = await tx.patient.findFirst({
      where: { id, doctor_id: doctorId, status: { not: "DELETED" } },
    });

    if (!patient) {
      throw new NotFoundException("patient not found");
    }

    return patient;
  }

  static async listPatients(
    doctorId: string,
    query: ParsedPatientListQuery,
    tx: PrismaClientOrTx = prisma,
  ): Promise<{
    data: PatientListItem[];
    page: number;
    limit: number;
    total: number;
  }> {
    const { page, limit, sortBy, sortOrder, where: searchWhere } = query;

    const where: Prisma.PatientWhereInput = {
      doctor_id: doctorId,
      status: { not: "DELETED" },
      ...searchWhere,
    };

    const [patients, total] = await Promise.all([
      tx.patient.findMany({
        where,
        select: {
          id: true,
          full_name: true,
          phone_number: true,
          created_at: true,
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      tx.patient.count({ where }),
    ]);

    const patientIds = patients.map((p) => p.id);

    // pull this page's sessions + payments in one query, reduce in
    // memory — avoids N+1 queries per patient
    const sessions =
      patientIds.length > 0
        ? await tx.session.findMany({
            where: {
              patient_id: { in: patientIds },
              status: { not: "DELETED" },
            },
            select: {
              patient_id: true,
              total_amount: true,
              payments: { select: { amount: true } },
            },
          })
        : [];

    const balanceByPatientId = new Map<
      string,
      { total_balance: number; paid_balance: number }
    >();

    for (const session of sessions) {
      const current = balanceByPatientId.get(session.patient_id) ?? {
        total_balance: 0,
        paid_balance: 0,
      };
      current.total_balance += session.total_amount;
      current.paid_balance += session.payments.reduce(
        (sum, p) => sum + p.amount,
        0,
      );
      balanceByPatientId.set(session.patient_id, current);
    }

    const data: PatientListItem[] = patients.map((p) => {
      const balance = balanceByPatientId.get(p.id) ?? {
        total_balance: 0,
        paid_balance: 0,
      };
      return {
        id: p.id,
        full_name: p.full_name,
        phone_number: p.phone_number,
        created_at: p.created_at,
        total_balance: balance.total_balance,
        paid_balance: balance.paid_balance,
        rest_balance: balance.total_balance - balance.paid_balance,
      };
    });

    return { data, page, limit, total };
  }

  static async createPatient(
    doctorId: string,
    data: PatientCreateInput,
    tx: PrismaClientOrTx = prisma,
  ) {
    return tx.patient.create({
      data: {
        doctor_id: doctorId,
        full_name: data.full_name,
        phone_number: data.phone_number,
        gender: data.gender,
        birth_date: data.birth_date ?? null,
        address: data.address ?? null,
        medical_history: data.medical_history ?? null,
        alergies: data.alergies ?? null,
      },
    });
  }

  static async updatePatient(
    id: string,
    doctorId: string,
    data: PatientUpdateInput,
    tx: PrismaClientOrTx = prisma,
  ) {
    await this.getPatient(id, doctorId, tx);

    try {
      return await tx.patient.update({
        where: { id },
        data: {
          ...data,
          updated_at: new Date(),
        },
      });
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new NotFoundException("patient not found");
      }
      throw new Error("Failed to update patient", { cause: error });
    }
  }

  static async softDeletePatient(
    id: string,
    doctorId: string,
    tx: PrismaClientOrTx = prisma,
  ): Promise<void> {
    await this.getPatient(id, doctorId, tx);

    try {
      await tx.patient.update({
        where: { id },
        data: { status: "DELETED", updated_at: new Date() },
      });
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new NotFoundException("patient not found");
      }
      throw new Error("Failed to delete patient", { cause: error });
    }
  }
}
