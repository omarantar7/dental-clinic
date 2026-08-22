import prisma from "@/lib/db";
import { UserRepository } from "@/repositories/user.repository";
import { SecretaryRepository } from "@/repositories/secretary.repository";
import { DoctorRepository } from "@/repositories/doctor.repository";
import { BadRequestException } from "@/exceptions/http/BadRequestException";
import { NotFoundException } from "@/exceptions/http/NotFoundException";
import type {
  SecretaryCreateInput,
  SecretaryResponse,
} from "@/types/secertary";

export class SecretaryService {
  static async listSecretaries(
    doctorId: string,
    query: Parameters<typeof SecretaryRepository.listSecretariesByDoctorId>[1],
  ) {
    return SecretaryRepository.listSecretariesByDoctorId(doctorId, query);
  }

  static async createSecretary(
    doctorId: string,
    data: SecretaryCreateInput,
  ): Promise<SecretaryResponse> {
    return prisma.$transaction(async (tx) => {
      const doctor = await DoctorRepository.getDoctor(doctorId, tx).catch(
        () => null,
      );
      if (!doctor)
        throw new NotFoundException("doctor not found for this secretary");

      const role = data.role_id
        ? await tx.role.findFirst({
              where: { id: data.role_id, doctor_id: doctorId },
          })
        : null;
      if (data.role_id && !role)
        throw new BadRequestException("role does not belong to doctor");

      const user = await UserRepository.createUser(
        {
          role: "SECRETARY",
          email: data.email,
          password_hash: data.password,
          phone_number: data.phone_number,
          full_name: data.full_name ?? null,
          address: data.address ?? null,
        },
        tx,
      );
      const secretary = await SecretaryRepository.createSecretary(
        {
          user_id: user.id,
          doctor_id: doctorId,
          hired_at: data.hired_at,
          role_id: data.role_id,
        },
        tx,
      );
      return {
        id: secretary.id,
        user_id: secretary.user_id,
        doctor_id: secretary.doctor_id,
        role_id: secretary.role_id ?? null,
        role_name: role?.name ?? null,
        email: user.email,
        phone_number: user.phone_number,
        full_name: user.full_name,
        status: "ENABLED",
        hired_at: secretary.hired_at ?? null,
        created_at: secretary.created_at,
        updated_at: secretary.updated_at,
      };
    });
  }

  static async getSecretaryProfile(userId: string) {
    return SecretaryRepository.getSecretaryByUserId(userId);
  }
}
