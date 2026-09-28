import { beforeEach, describe, expect, it, vi } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";

import { ALL_PERMISSION_CODES, PERMISSIONS } from "@/config/permissions";
import {
  AccountDisabledException,
  AuthenticationFailedException,
} from "@/exceptions/http/AuthenticationException";
import { ForbiddenException } from "@/exceptions/http/ForbiddenException";
import { NotFoundException } from "@/exceptions/http/NotFoundException";
import { AuthorizationService } from "@/services/authorization.service";
import type { IDoctorRepository } from "@/types/doctor";
import type {
  ISecretaryRepository,
  SecretaryAccessContext,
} from "@/types/secertary";
import type { TokenUserPayload } from "@/config/types";

// The service module also exports singletons wired to Prisma; stub those
// modules so the tests never load database code.
vi.mock("@/repositories/doctor.repository", () => ({ doctorRepository: {} }));
vi.mock("@/repositories/secretary.repository", () => ({
  secretaryRepository: {},
}));

const doctorPayload: TokenUserPayload = { userId: "user-doc", role: "DOCTOR" };
const secretaryPayload: TokenUserPayload = {
  userId: "user-sec",
  role: "SECRETARY",
};

function secretaryContext(
  overrides: Partial<SecretaryAccessContext> = {},
): SecretaryAccessContext {
  return {
    doctorId: "doc-1",
    status: "ENABLED",
    permissionCodes: [],
    ...overrides,
  };
}

describe("AuthorizationService.getAccessContext", () => {
  let doctorRepository: MockProxy<IDoctorRepository>;
  let secretaryRepository: MockProxy<ISecretaryRepository>;
  let service: AuthorizationService;

  beforeEach(() => {
    doctorRepository = mock<IDoctorRepository>();
    secretaryRepository = mock<ISecretaryRepository>();
    service = new AuthorizationService(doctorRepository, secretaryRepository);
  });

  describe("doctor", () => {
    it("gets every permission and their own doctorId", async () => {
      doctorRepository.getDoctorByUserId.mockResolvedValue({
        id: "doc-1",
        user_id: "user-doc",
        clinic_address: null,
      });

      const access = await service.getAccessContext(doctorPayload);

      expect(access.doctorId).toBe("doc-1");
      expect([...access.permissions].sort()).toEqual(
        [...ALL_PERMISSION_CODES].sort(),
      );
      expect(secretaryRepository.getAccessContextByUserId).not.toHaveBeenCalled();
    });

    it("throws NotFound when the doctor profile is missing", async () => {
      doctorRepository.getDoctorByUserId.mockResolvedValue(null);

      await expect(service.getAccessContext(doctorPayload)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("secretary", () => {
    it("gets exactly their role's permissions and their doctor's id, in one query", async () => {
      secretaryRepository.getAccessContextByUserId.mockResolvedValue(
        secretaryContext({
          permissionCodes: [PERMISSIONS.PATIENTS_VIEW, PERMISSIONS.SESSIONS_VIEW],
        }),
      );

      const access = await service.getAccessContext(secretaryPayload);

      expect(access.doctorId).toBe("doc-1");
      expect([...access.permissions].sort()).toEqual(
        [PERMISSIONS.PATIENTS_VIEW, PERMISSIONS.SESSIONS_VIEW].sort(),
      );
      expect(secretaryRepository.getAccessContextByUserId).toHaveBeenCalledTimes(1);
      expect(secretaryRepository.getAccessContextByUserId).toHaveBeenCalledWith(
        "user-sec",
      );
      expect(doctorRepository.getDoctorByUserId).not.toHaveBeenCalled();
    });

    it("gets no permissions when they have no role", async () => {
      secretaryRepository.getAccessContextByUserId.mockResolvedValue(
        secretaryContext({ permissionCodes: [] }),
      );

      const access = await service.getAccessContext(secretaryPayload);

      expect(access.permissions.size).toBe(0);
    });

    it("ignores codes in the database that aren't in the config", async () => {
      secretaryRepository.getAccessContextByUserId.mockResolvedValue(
        secretaryContext({
          permissionCodes: [PERMISSIONS.PATIENTS_VIEW, "EDIT_PAYMENT", "MANAGE_PATIENTS"],
        }),
      );

      const access = await service.getAccessContext(secretaryPayload);

      expect([...access.permissions]).toEqual([PERMISSIONS.PATIENTS_VIEW]);
    });

    it("rejects a disabled secretary even if their role has permissions", async () => {
      secretaryRepository.getAccessContextByUserId.mockResolvedValue(
        secretaryContext({
          status: "DISABLED",
          permissionCodes: [PERMISSIONS.PATIENTS_VIEW],
        }),
      );

      await expect(service.getAccessContext(secretaryPayload)).rejects.toThrow(
        AccountDisabledException,
      );
    });

    it("rejects a deleted secretary", async () => {
      secretaryRepository.getAccessContextByUserId.mockResolvedValue(
        secretaryContext({ status: "DELETED" }),
      );

      await expect(service.getAccessContext(secretaryPayload)).rejects.toThrow(
        AuthenticationFailedException,
      );
    });

    it("throws NotFound when the secretary profile is missing", async () => {
      secretaryRepository.getAccessContextByUserId.mockResolvedValue(null);

      await expect(service.getAccessContext(secretaryPayload)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  it("rejects an unknown role from a tampered or outdated token", async () => {
    const payload = { userId: "x", role: "ADMIN" } as unknown as TokenUserPayload;

    await expect(service.getAccessContext(payload)).rejects.toThrow(
      ForbiddenException,
    );
  });
});
