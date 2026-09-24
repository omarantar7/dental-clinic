import { TokenUserPayload } from "@/config/types";
import { InsufficientPermissionException } from "@/exceptions/http/AuthorizationException";
import { ForbiddenException } from "@/exceptions/http/ForbiddenException";
import { NotFoundException } from "@/exceptions/http/NotFoundException";
import prisma from "@/lib/db";
import { DoctorRepository } from "@/repositories/doctor.repository";
import { SecretaryRepository } from "@/repositories/secretary.repository";

export class AuthorizationService {
  static async requirePermission(
    payload: TokenUserPayload,
    permissionCode: string,
  ): Promise<void> {
    if (payload.role === "DOCTOR") return;

    const secretary = await SecretaryRepository.getSecretaryByUserId(
      payload.userId,
    );
    if (!secretary) {
      throw new NotFoundException("Secretary profile not found");
    }

    const role = secretary.role_id
      ? await prisma.role.findUnique({
          where: { id: secretary.role_id },
          select: {
            role_permissions: {
              where: { permission: { code: permissionCode } },
              select: { id: true },
            },
          },
        })
      : null;

    if (!role || role.role_permissions.length === 0) {
      throw new InsufficientPermissionException();
    }
  }

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
