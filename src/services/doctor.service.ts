import prisma from "@/lib/db";
import type {
  DoctorProfile,
  RegisterDoctorInput,
  UpdateDoctorProfileInput,
} from "@/types/doctor";
import type { SafeUser } from "@/types/user";
import type { IdentifiableDoctor } from "@/types/doctor";
import { UserRepository } from "@/repositories/user.repository";
import { doctorRepository } from "@/repositories/doctor.repository";
import { NotFoundException } from "@/exceptions/http/NotFoundException";

export class DoctorService {
  static async createDoctor(
    data: RegisterDoctorInput,
  ): Promise<{ user: SafeUser; doctor: IdentifiableDoctor }> {
    return prisma.$transaction(async (tx) => {
      const user = await UserRepository.createUser(
        { ...data, role: "DOCTOR" },
        tx,
      );
      const doctor = await doctorRepository.createDoctor(
        { user_id: user.id, clinic_address: data.clinic_address },
        tx,
      );
      return { user, doctor };
    });
  }

  static async getMyProfile(userId: string): Promise<DoctorProfile> {
    return doctorRepository.getDoctorProfileByUserId(userId);
  }

  static async updateMyProfile(
    userId: string,
    data: UpdateDoctorProfileInput,
  ): Promise<DoctorProfile> {
    const { clinic_address, phone_number, address, full_name } = data;

    return prisma.$transaction(async (tx) => {
      const doctor = await doctorRepository.getDoctorByUserId(userId, tx);
      if (!doctor)
        throw new NotFoundException("Doctor not found for this user");

      if (
        phone_number !== undefined ||
        address !== undefined ||
        full_name !== undefined
      ) {
        await UserRepository.updateUser(
          userId,
          {
            ...(phone_number !== undefined && { phone_number }),
            ...(address !== undefined && { address }),
            ...(full_name !== undefined && { full_name }),
          },
          tx,
        );
      }

      if (clinic_address !== undefined) {
        await doctorRepository.updateDoctor(doctor.id, { clinic_address }, tx);
      }

      return doctorRepository.getDoctorProfileByUserId(userId, tx);
    });
  }
}
