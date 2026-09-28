import { beforeEach, describe, expect, it, vi } from "vitest";
import { mock, type MockProxy } from "vitest-mock-extended";

import { PERMISSIONS } from "@/config/permissions";
import { ConflictException } from "@/exceptions/http/ConflictException";
import { NotFoundException } from "@/exceptions/http/NotFoundException";
import { RoleService } from "@/services/role.service";
import type { IPermissionRepository } from "@/types/permission";
import type { IRoleRepository, RoleListItem } from "@/types/role";

// Stub the Prisma-backed singletons the service module exports.
vi.mock("@/repositories/role.repository", () => ({ roleRepository: {} }));
vi.mock("@/repositories/permission.repository", () => ({
  permissionRepository: {},
}));

function role(overrides: Partial<RoleListItem> = {}): RoleListItem {
  return {
    id: "role-1",
    name: "Front Desk",
    permission_codes: [],
    secretary_count: 0,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  };
}

describe("RoleService", () => {
  let roleRepository: MockProxy<IRoleRepository>;
  let permissionRepository: MockProxy<IPermissionRepository>;
  let service: RoleService;

  beforeEach(() => {
    roleRepository = mock<IRoleRepository>();
    permissionRepository = mock<IPermissionRepository>();
    service = new RoleService(roleRepository, permissionRepository);
  });

  describe("createRole", () => {
    it("resolves permission codes to ids and creates the role for the doctor", async () => {
      permissionRepository.findByCodes.mockResolvedValue([
        { id: "perm-1", code: PERMISSIONS.PATIENTS_VIEW, description: null },
        { id: "perm-2", code: PERMISSIONS.SESSIONS_VIEW, description: null },
      ]);
      roleRepository.create.mockResolvedValue(role());

      await service.createRole("doc-1", {
        name: "Front Desk",
        permission_codes: [PERMISSIONS.PATIENTS_VIEW, PERMISSIONS.SESSIONS_VIEW],
      });

      expect(roleRepository.create).toHaveBeenCalledWith("doc-1", {
        name: "Front Desk",
        permission_ids: ["perm-1", "perm-2"],
      });
    });

    it("skips the permission lookup for a role with no permissions", async () => {
      roleRepository.create.mockResolvedValue(role());

      await service.createRole("doc-1", { name: "Empty", permission_codes: [] });

      expect(permissionRepository.findByCodes).not.toHaveBeenCalled();
      expect(roleRepository.create).toHaveBeenCalledWith("doc-1", {
        name: "Empty",
        permission_ids: [],
      });
    });

    it("fails loudly, naming the missing code, when the permission table isn't synced", async () => {
      permissionRepository.findByCodes.mockResolvedValue([
        { id: "perm-1", code: PERMISSIONS.PATIENTS_VIEW, description: null },
      ]);

      await expect(
        service.createRole("doc-1", {
          name: "Front Desk",
          permission_codes: [PERMISSIONS.PATIENTS_VIEW, PERMISSIONS.IMAGES_UPDATE],
        }),
      ).rejects.toThrow(/IMAGES_UPDATE.*sync-permissions/);
      expect(roleRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("updateRole", () => {
    it("renames without touching permissions when only the name is sent", async () => {
      roleRepository.update.mockResolvedValue(role());

      await service.updateRole("role-1", "doc-1", { name: "Reception" });

      expect(permissionRepository.findByCodes).not.toHaveBeenCalled();
      expect(roleRepository.update).toHaveBeenCalledWith("role-1", "doc-1", {
        name: "Reception",
      });
    });

    it("replaces permissions when codes are sent", async () => {
      permissionRepository.findByCodes.mockResolvedValue([
        { id: "perm-9", code: PERMISSIONS.CALENDAR_VIEW, description: null },
      ]);
      roleRepository.update.mockResolvedValue(role());

      await service.updateRole("role-1", "doc-1", {
        permission_codes: [PERMISSIONS.CALENDAR_VIEW],
      });

      expect(roleRepository.update).toHaveBeenCalledWith("role-1", "doc-1", {
        permission_ids: ["perm-9"],
      });
    });
  });

  describe("deleteRole", () => {
    it("deletes a role that no secretary uses", async () => {
      roleRepository.findByIdForDoctor.mockResolvedValue(role());

      await service.deleteRole("role-1", "doc-1");

      expect(roleRepository.delete).toHaveBeenCalledWith("role-1", "doc-1");
    });

    it("blocks deleting a role that secretaries still use, with the count", async () => {
      roleRepository.findByIdForDoctor.mockResolvedValue(
        role({ secretary_count: 2 }),
      );

      const error = await service
        .deleteRole("role-1", "doc-1")
        .catch((caught: unknown) => caught);

      expect(error).toBeInstanceOf(ConflictException);
      expect((error as ConflictException).details).toEqual({
        code: "ROLE_IN_USE",
        secretary_count: 2,
      });
      expect((error as ConflictException).message).toMatch(/2 secretaries/);
      expect(roleRepository.delete).not.toHaveBeenCalled();
    });

    it("treats another doctor's role as not found, without revealing its usage", async () => {
      roleRepository.findByIdForDoctor.mockResolvedValue(null);

      await expect(service.deleteRole("role-1", "doc-2")).rejects.toThrow(
        NotFoundException,
      );
      expect(roleRepository.findByIdForDoctor).toHaveBeenCalledWith(
        "role-1",
        "doc-2",
      );
      expect(roleRepository.delete).not.toHaveBeenCalled();
    });
  });

  it("lists only the given doctor's roles", async () => {
    roleRepository.listByDoctor.mockResolvedValue([role()]);

    const roles = await service.listRoles("doc-1");

    expect(roleRepository.listByDoctor).toHaveBeenCalledWith("doc-1");
    expect(roles).toHaveLength(1);
  });
});
