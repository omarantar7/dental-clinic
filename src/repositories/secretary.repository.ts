import { NotFoundException } from "@/exceptions/http/NotFoundException";
import prisma from "@/lib/db";
import { Prisma } from "@/app/generated/prisma/client";
import type { IdentifiableSecretary, Secretary } from "@/types/secertary";

type PrismaClientOrTx = typeof prisma | Prisma.TransactionClient;

export class SecretaryRepository {
  static async createSecretary(
    data: Secretary,
    tx: PrismaClientOrTx = prisma,
  ): Promise<IdentifiableSecretary> {
    try {
      const secretary = await tx.secretary.create({
        data: {
          user_id: data.user_id,
          doctor_id: data.doctor_id,
          hired_at: data.hired_at ?? new Date(),
          role_id: data.role_id ?? null,
        },
      });
      return this.toIdentifiableSecretary(secretary);
    } catch (error: any) {
      throw new Error("Failed to create secretary", { cause: error });
    }
  }

  static async getSecretary(
    id: string,
    tx: PrismaClientOrTx = prisma,
  ): Promise<IdentifiableSecretary> {
    const secretary = await tx.secretary.findUnique({ where: { id } });
    if (!secretary) throw new NotFoundException("secretary not found");
    return this.toIdentifiableSecretary(secretary);
  }

  static async getSecretaryByUserId(
    userId: string,
    tx: PrismaClientOrTx = prisma,
  ): Promise<IdentifiableSecretary | null> {
    const secretary = await tx.secretary.findUnique({
      where: { user_id: userId },
    });
    return secretary ? this.toIdentifiableSecretary(secretary) : null;
  }

  static async listSecretariesByDoctorId(
    doctorId: string,
    tx: PrismaClientOrTx = prisma,
  ): Promise<IdentifiableSecretary[]> {
    const secretaries = await tx.secretary.findMany({
      where: { doctor_id: doctorId },
      orderBy: { created_at: "desc" },
    });
    return secretaries.map((s) => this.toIdentifiableSecretary(s));
  }

  static async updateSecretary(
    id: string,
    data: Partial<Pick<Secretary, "doctor_id" | "role_id">>,
    tx: PrismaClientOrTx = prisma,
  ): Promise<IdentifiableSecretary> {
    try {
      const secretary = await tx.secretary.update({
        where: { id },
        data: { ...data, updated_at: new Date() },
      });
      return this.toIdentifiableSecretary(secretary);
    } catch (error: any) {
      if (error.code === "P2025")
        throw new NotFoundException("secretary not found");
      throw new Error("Failed to update secretary", { cause: error });
    }
  }

  static async deleteSecretary(
    id: string,
    tx: PrismaClientOrTx = prisma,
  ): Promise<void> {
    try {
      await tx.secretary.delete({ where: { id } });
    } catch (error: any) {
      if (error.code === "P2025")
        throw new NotFoundException("secretary not found");
      throw new Error("Failed to delete secretary", { cause: error });
    }
  }

  private static toIdentifiableSecretary(secretary: {
    id: string;
    user_id: string;
    doctor_id: string;
    hired_at: Date | null;
    role_id: string | null;
  }): IdentifiableSecretary {
    return {
      id: secretary.id,
      user_id: secretary.user_id,
      doctor_id: secretary.doctor_id,
      hired_at: secretary.hired_at ?? undefined,
      role_id: secretary.role_id,
    };
  }
}
