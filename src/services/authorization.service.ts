import { TokenUserPayload } from "@/config/types";
import { ForbiddenException } from "@/exceptions/http/ForbiddenException";
import { NotFoundException } from "@/exceptions/http/NotFoundException";
import { DoctorRepository } from "@/repositories/doctor.repository";
import { SecretaryRepository } from "@/repositories/secretary.repository";

export class AuthorizationService {
  static async resolveDoctorId(payload: TokenUserPayload): Promise<string> {
    if (payload.role === "DOCTOR") {
      const doctor = await DoctorRepository.getDoctorByUserId(payload.userId);
      if (!doctor) throw new NotFoundException("Doctor profile not found");
      return doctor.id;
    }

    if (payload.role === "SECRETARY") {
      const secretary = await SecretaryRepository.getSecretaryByUserId(
        payload.userId,
      );
      if (!secretary)
        throw new NotFoundException("Secretary profile not found");
      return secretary.doctor_id;
    }

    throw new ForbiddenException("Role not permitted for this resource");
  }
}
