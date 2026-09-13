import prisma from "@/lib/db";
import { UserRepository } from "@/repositories/user.repository";
import { SecretaryRepository } from "@/repositories/secretary.repository";
import { DoctorRepository } from "@/repositories/doctor.repository";
import { BadRequestException } from "@/exceptions/http/BadRequestException";
import { NotFoundException } from "@/exceptions/http/NotFoundException";
import { EmailService } from "@/services/email.service";
import { secretaryInvitationTemplate } from "@/services/email-templates/secretary-invitation.template";
import type {
  SecretaryCreateInput,
  SecretaryResponse,
  SecretaryUpdateInput,
  SecretaryUpdateProfileInput,
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
    const secretary = await prisma.$transaction(async (tx) => {
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
      const response = {
        id: secretary.id,
        user_id: secretary.user_id,
        doctor_id: secretary.doctor_id,
        role_id: secretary.role_id ?? null,
        role_name: role?.name ?? null,
        email: user.email,
        phone_number: user.phone_number,
        full_name: user.full_name,
        status: "ENABLED" as const,
        hired_at: secretary.hired_at ?? null,
        created_at: secretary.created_at,
        updated_at: secretary.updated_at,
      };

      await EmailService.sendEmail(
        response.email,
        secretaryInvitationTemplate({
          fullName: response.full_name,
          email: response.email,
          temporaryPassword: data.password,
        }),
      );

      return response;
    });

    return secretary;
  }

  static async updateSecretary(
    id: string,
    doctorId: string,
    data: SecretaryUpdateInput,
  ): Promise<SecretaryResponse> {
    return prisma.$transaction(async (tx) => {
      if (data.role_id) {
        const role = await tx.role.findFirst({
          where: { id: data.role_id, doctor_id: doctorId },
          select: { id: true },
        });
        if (!role) throw new BadRequestException("role does not belong to doctor");
      }

      return SecretaryRepository.updateSecretary(id, doctorId, data, tx);
    });
  }

  static async deleteSecretary(id: string, doctorId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await SecretaryRepository.deleteSecretary(id, doctorId, tx);
    });
  }

  static async getMyProfile(userId: string): Promise<SecretaryResponse> {
    return SecretaryRepository.getSecretaryProfileByUserId(userId);
  }

  static async updateMyProfile(
    userId: string,
    data: SecretaryUpdateProfileInput,
  ): Promise<SecretaryResponse> {
    return SecretaryRepository.updateSecretaryProfileByUserId(userId, data);
  }
}
