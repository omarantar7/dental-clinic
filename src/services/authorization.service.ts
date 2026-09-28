import { TokenUserPayload } from "@/config/types";
import {
  ALL_PERMISSION_CODES,
  isPermissionCode,
  type PermissionCode,
} from "@/config/permissions";
import {
  AccountDisabledException,
  AuthenticationFailedException,
} from "@/exceptions/http/AuthenticationException";
import { ForbiddenException } from "@/exceptions/http/ForbiddenException";
import { NotFoundException } from "@/exceptions/http/NotFoundException";
import { doctorRepository } from "@/repositories/doctor.repository";
import { secretaryRepository } from "@/repositories/secretary.repository";
import type { AccessContext } from "@/types/authorization";
import type { IDoctorRepository } from "@/types/doctor";
import type { ISecretaryRepository } from "@/types/secertary";

const ALL_PERMISSIONS: ReadonlySet<PermissionCode> = new Set(
  ALL_PERMISSION_CODES,
);

export class AuthorizationService {
  constructor(
    private readonly doctorRepository: IDoctorRepository,
    private readonly secretaryRepository: ISecretaryRepository,
  ) {}

  async getAccessContext(payload: TokenUserPayload): Promise<AccessContext> {
    switch (payload.role) {
      case "DOCTOR":
        return this.getDoctorAccessContext(payload.userId);
      case "SECRETARY":
        return this.getSecretaryAccessContext(payload.userId);
      default:
        // The payload comes from a token, so guard against unknown roles at runtime.
        throw new ForbiddenException("Role not permitted for this resource");
    }
  }

  private async getDoctorAccessContext(userId: string): Promise<AccessContext> {
    const doctor = await this.doctorRepository.getDoctorByUserId(userId);
    if (!doctor) throw new NotFoundException("Doctor profile not found");
    return { doctorId: doctor.id, permissions: ALL_PERMISSIONS };
  }

  private async getSecretaryAccessContext(
    userId: string,
  ): Promise<AccessContext> {
    const secretary =
      await this.secretaryRepository.getAccessContextByUserId(userId);
    if (!secretary) throw new NotFoundException("Secretary profile not found");

    // Checked on every request rather than only at login: the JWT outlives a
    // status change, so this is what actually revokes access.
    if (secretary.status === "DISABLED") throw new AccountDisabledException();
    if (secretary.status === "DELETED")
      throw new AuthenticationFailedException();

    return {
      doctorId: secretary.doctorId,
      permissions: new Set(secretary.permissionCodes.filter(isPermissionCode)),
    };
  }
}

// Convenience singleton for call sites that don't need custom DI.
// For tests, construct AuthorizationService with mock repositories instead.
export const authorizationService = new AuthorizationService(
  doctorRepository,
  secretaryRepository,
);
