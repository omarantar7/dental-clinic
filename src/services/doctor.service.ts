import prisma from "@/lib/db";
import type {
  DoctorProfile,
  RegisterDoctorInput,
} from "@/types/doctor";
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

  static async getMyProfile(userId: string): Promise<DoctorProfile> {
    return DoctorRepository.getDoctorProfileByUserId(userId);
  }

 
}
