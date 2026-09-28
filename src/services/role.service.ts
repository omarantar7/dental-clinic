import type { PermissionCode } from "@/config/permissions";
import { ConflictException } from "@/exceptions/http/ConflictException";
import { NotFoundException } from "@/exceptions/http/NotFoundException";
import { permissionRepository } from "@/repositories/permission.repository";
import { roleRepository } from "@/repositories/role.repository";
import type { IPermissionRepository, PermissionRecord } from "@/types/permission";
import type {
  IRoleRepository,
  RoleCreateInput,
  RoleListItem,
  RoleUpdateInput,
} from "@/types/role";

export class RoleService {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  // The catalog a doctor picks from when building a role.
  async listPermissions(): Promise<PermissionRecord[]> {
    return this.permissionRepository.findAll();
  }

  async listRoles(doctorId: string): Promise<RoleListItem[]> {
    return this.roleRepository.listByDoctor(doctorId);
  }

  async createRole(
    doctorId: string,
    input: RoleCreateInput,
  ): Promise<RoleListItem> {
    const permission_ids = await this.resolvePermissionIds(
      input.permission_codes,
    );
    return this.roleRepository.create(doctorId, {
      name: input.name,
      permission_ids,
    });
  }

  async updateRole(
    id: string,
    doctorId: string,
    input: RoleUpdateInput,
  ): Promise<RoleListItem> {
    const permission_ids =
      input.permission_codes !== undefined
        ? await this.resolvePermissionIds(input.permission_codes)
        : undefined;

    return this.roleRepository.update(id, doctorId, {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(permission_ids !== undefined ? { permission_ids } : {}),
    });
  }

  async deleteRole(id: string, doctorId: string): Promise<void> {
    // Ownership is checked before the count, so another doctor's role can't
    // be probed for how many secretaries it has.
    const role = await this.roleRepository.findByIdForDoctor(id, doctorId);
    if (!role) throw new NotFoundException("role not found");

    // Deleting would silently unassign these secretaries (ON DELETE SET NULL),
    // and with no role they lose all access — make the doctor reassign first.
    if (role.secretary_count > 0) {
      throw new ConflictException(
        `This role is assigned to ${role.secretary_count} secretar${role.secretary_count === 1 ? "y" : "ies"}. Reassign them before deleting it.`,
        { code: "ROLE_IN_USE", secretary_count: role.secretary_count },
      );
    }

    await this.roleRepository.delete(id, doctorId);
  }

  private async resolvePermissionIds(
    codes: PermissionCode[],
  ): Promise<string[]> {
    if (codes.length === 0) return [];

    const permissions = await this.permissionRepository.findByCodes(codes);
    if (permissions.length !== codes.length) {
      // Zod already limited codes to the config list, so a miss means the
      // permission table wasn't synced — a deployment problem, not bad input.
      const found = new Set(permissions.map(({ code }) => code));
      const missing = codes.filter((code) => !found.has(code));
      throw new Error(
        `Permission table is out of sync with config (missing: ${missing.join(", ")}). Run sync-permissions.`,
      );
    }

    return permissions.map(({ id }) => id);
  }
}

// Convenience singleton for call sites that don't need custom DI.
// For tests, construct RoleService with mock repositories instead.
export const roleService = new RoleService(roleRepository, permissionRepository);
