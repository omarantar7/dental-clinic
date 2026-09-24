import prisma from "@/lib/db";
import type { RegisterDoctorInput } from "@/types/doctor";
import type { SafeUser } from "@/types/user";
import type { IdentifiableDoctor } from "@/types/doctor";
import { UserRepository } from "@/repositories/user.repository";
import { DoctorRepository } from "@/repositories/doctor.repository";

export class DoctorService {
  static async createDoctor(
    data: RegisterDoctorInput,
  ): Promise<{ user: SafeUser; doctor: IdentifiableDoctor }> {
    return prisma.$transaction(async (tx) => {
      const user = await UserRepository.createUser(
        { ...data, role: "DOCTOR" },
        tx,
      );
      const doctor = await DoctorRepository.createDoctor(
        { user_id: user.id, clinic_address: data.clinic_address },
        tx,
      );
      return { user, doctor };
    });
  }

  static async getDoctorProfile(userId: string) {
    return DoctorRepository.getDoctorByUserId(userId);
  }
}
