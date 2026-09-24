import prisma from "@/lib/db";
import { UserRepository } from "@/repositories/user.repository";
import { SecretaryRepository } from "@/repositories/secretary.repository";
import { DoctorRepository } from "@/repositories/doctor.repository";
import type { SafeUser } from "@/types/user";
import { NotFoundException } from "@/exceptions/http/NotFoundException";
import type {
  IdentifiableSecretary,
  RegisterSecretaryInput,
} from "@/types/secertary";

export class SecretaryService {
  static async createSecretary(
    data: RegisterSecretaryInput,
  ): Promise<{ user: SafeUser; secretary: IdentifiableSecretary }> {
    return prisma.$transaction(async (tx) => {
      const doctor = await DoctorRepository.getDoctor(data.doctor_id, tx).catch(
        () => null,
      );
      if (!doctor)
        throw new NotFoundException("doctor not found for this secretary");

      const user = await UserRepository.createUser(
        { ...data, role: "SECRETARY" },
        tx,
      );
      const secretary = await SecretaryRepository.createSecretary(
        {
          user_id: user.id,
          doctor_id: data.doctor_id,
          hired_at: data.hired_at,
          role_id: data.role_id,
        },
        tx,
      );
      return { user, secretary };
    });
  }

  static async getSecretaryProfile(userId: string) {
    return SecretaryRepository.getSecretaryByUserId(userId);
  }
}
