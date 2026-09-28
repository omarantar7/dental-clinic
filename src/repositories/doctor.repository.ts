import { NotFoundException } from "@/exceptions/http/NotFoundException";
import prisma from "@/lib/db";
import type { PrismaClient } from "@/app/generated/prisma/client";
import { isPrismaError } from "@/lib/prisma-errors";
import type { PrismaClientOrTx } from "@/types/db";
import type {
  Doctor,
  DoctorProfile,
  IDoctorRepository,
  IdentifiableDoctor,
} from "@/types/doctor";

export class DoctorRepository implements IDoctorRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async createDoctor(
    data: Doctor,
    tx: PrismaClientOrTx = this.db,
  ): Promise<IdentifiableDoctor> {
    try {
      const doctor = await tx.doctor.create({
        data: { user_id: data.user_id, clinic_address: data.clinic_address },
      });
      return this.toIdentifiableDoctor(doctor);
    } catch (error) {
      throw new Error("Failed to create doctor", { cause: error });
    }
  }

  async getDoctor(
    id: string,
    tx: PrismaClientOrTx = this.db,
  ): Promise<IdentifiableDoctor> {
    const doctor = await tx.doctor.findUnique({ where: { id } });
    if (!doctor) throw new NotFoundException("doctor not found");
    return this.toIdentifiableDoctor(doctor);
  }

  async getDoctorByUserId(
    userId: string,
    tx: PrismaClientOrTx = this.db,
  ): Promise<IdentifiableDoctor | null> {
    const doctor = await tx.doctor.findUnique({ where: { user_id: userId } });
    return doctor ? this.toIdentifiableDoctor(doctor) : null;
  }

  async getDoctorProfileByUserId(
    userId: string,
    tx: PrismaClientOrTx = this.db,
  ): Promise<DoctorProfile> {
    const doctor = await tx.doctor.findUnique({
      where: { user_id: userId },
      include: { user: true },
    });
    if (!doctor) throw new NotFoundException("doctor not found");
    return this.toDoctorProfile(doctor);
  }

  async updateDoctor(
    id: string,
    data: Partial<Pick<Doctor, "clinic_address">>,
    tx: PrismaClientOrTx = this.db,
  ): Promise<IdentifiableDoctor> {
    try {
      const doctor = await tx.doctor.update({
        where: { id },
        data: { ...data, updated_at: new Date() },
      });
      return this.toIdentifiableDoctor(doctor);
    } catch (error) {
      if (isPrismaError(error, "P2025"))
        throw new NotFoundException("doctor not found");
      throw new Error("Failed to update doctor", { cause: error });
    }
  }

  async deleteDoctor(
    id: string,
    tx: PrismaClientOrTx = this.db,
  ): Promise<void> {
    try {
      await tx.doctor.delete({ where: { id } });
    } catch (error) {
      if (isPrismaError(error, "P2025"))
        throw new NotFoundException("doctor not found");
      throw new Error("Failed to delete doctor", { cause: error });
    }
  }

  private toIdentifiableDoctor(doctor: {
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

  private toDoctorProfile(doctor: {
    id: string;
    user_id: string;
    clinic_address: string | null;
    created_at: Date;
    updated_at: Date;
    user: {
      email: string;
      phone_number: string;
      address: string | null;
      full_name: string | null;
    };
  }): DoctorProfile {
    return {
      id: doctor.id,
      user_id: doctor.user_id,
      clinic_address: doctor.clinic_address,
      email: doctor.user.email,
      phone_number: doctor.user.phone_number,
      address: doctor.user.address,
      full_name: doctor.user.full_name,
      created_at: doctor.created_at,
      updated_at: doctor.updated_at,
    };
  }
}

// Convenience singleton for call sites that don't need custom DI.
// For tests, construct DoctorRepository with a mock PrismaClient instead.
export const doctorRepository = new DoctorRepository();
