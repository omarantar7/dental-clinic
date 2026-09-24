import { NotFoundException } from "@/exceptions/http/NotFoundException";
import prisma from "@/lib/db";
import { Prisma } from "@/app/generated/prisma/client";
import { Doctor, IdentifiableDoctor } from "@/types/doctor";

type PrismaClientOrTx = typeof prisma | Prisma.TransactionClient;

export class DoctorRepository {
  static async createDoctor(
    data: Doctor,
    tx: PrismaClientOrTx = prisma,
  ): Promise<IdentifiableDoctor> {
    try {
      const doctor = await tx.doctor.create({
        data: { user_id: data.user_id, clinic_address: data.clinic_address },
      });
      return this.toIdentifiableDoctor(doctor);
    } catch (error: any) {
      throw new Error("Failed to create doctor", { cause: error });
    }
  }

  static async getDoctor(
    id: string,
    tx: PrismaClientOrTx = prisma,
  ): Promise<IdentifiableDoctor> {
    const doctor = await tx.doctor.findUnique({ where: { id } });
    if (!doctor) throw new NotFoundException("doctor not found");
    return this.toIdentifiableDoctor(doctor);
  }

  static async getDoctorByUserId(
    userId: string,
    tx: PrismaClientOrTx = prisma,
  ): Promise<IdentifiableDoctor | null> {
    const doctor = await tx.doctor.findUnique({ where: { user_id: userId } });
    return doctor ? this.toIdentifiableDoctor(doctor) : null;
  }

  static async updateDoctor(
    id: string,
    data: Partial<Pick<Doctor, "clinic_address">>,
    tx: PrismaClientOrTx = prisma,
  ): Promise<IdentifiableDoctor> {
    try {
      const doctor = await tx.doctor.update({
        where: { id },
        data: { ...data, updated_at: new Date() },
      });
      return this.toIdentifiableDoctor(doctor);
    } catch (error: any) {
      if (error.code === "P2025")
        throw new NotFoundException("doctor not found");
      throw new Error("Failed to update doctor", { cause: error });
    }
  }

  static async deleteDoctor(
    id: string,
    tx: PrismaClientOrTx = prisma,
  ): Promise<void> {
    try {
      await tx.doctor.delete({ where: { id } });
    } catch (error: any) {
      if (error.code === "P2025")
        throw new NotFoundException("doctor not found");
      throw new Error("Failed to delete doctor", { cause: error });
    }
  }

  private static toIdentifiableDoctor(doctor: {
    id: string;
    user_id: string;
    clinic_address: string | null;
  }): IdentifiableDoctor {
    return {
      id: doctor.id,
      user_id: doctor.user_id,
      clinic_address: doctor.clinic_address,
    };
  }
}
