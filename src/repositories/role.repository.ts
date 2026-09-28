import { NotFoundException } from "@/exceptions/http/NotFoundException";
import UniqueException from "@/exceptions/http/UniqueException";
import prisma from "@/lib/db";
import type { Prisma, PrismaClient } from "@/app/generated/prisma/client";
import { isPrismaError } from "@/lib/prisma-errors";
import type { PrismaClientOrTx } from "@/types/db";
import type {
  IRoleRepository,
  RoleListItem,
  RoleWriteData,
} from "@/types/role";

const ACTIVE_SECRETARY_WHERE = {
  user: { status: { not: "DELETED" } },
} satisfies Prisma.SecretaryWhereInput;

const ROLE_SELECT = {
  id: true,
  name: true,
  created_at: true,
  updated_at: true,
  role_permissions: { select: { permission: { select: { code: true } } } },
  _count: { select: { secretaries: { where: ACTIVE_SECRETARY_WHERE } } },
} satisfies Prisma.RoleSelect;

type RoleRow = Prisma.RoleGetPayload<{ select: typeof ROLE_SELECT }>;

export class RoleRepository implements IRoleRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async findByIdForDoctor(
    id: string,
    doctorId: string,
    tx: PrismaClientOrTx = this.db,
  ): Promise<RoleListItem | null> {
    const role = await tx.role.findFirst({
      where: { id, doctor_id: doctorId },
      select: ROLE_SELECT,
    });
    return role ? this.toRoleListItem(role) : null;
  }

  async listByDoctor(
    doctorId: string,
    tx: PrismaClientOrTx = this.db,
  ): Promise<RoleListItem[]> {
    const roles = await tx.role.findMany({
      where: { doctor_id: doctorId },
      select: ROLE_SELECT,
      orderBy: { name: "asc" },
    });
    return roles.map((role) => this.toRoleListItem(role));
  }

  async create(
    doctorId: string,
    data: RoleWriteData,
    tx: PrismaClientOrTx = this.db,
  ): Promise<RoleListItem> {
    try {
      const role = await tx.role.create({
        data: {
          doctor_id: doctorId,
          name: data.name,
          role_permissions: {
            create: data.permission_ids.map((permission_id) => ({
              permission_id,
            })),
          },
        },
        select: ROLE_SELECT,
      });
      return this.toRoleListItem(role);
    } catch (error) {
      if (isPrismaError(error, "P2002"))
        throw new UniqueException("A role with this name already exists");
      throw new Error("Failed to create role", { cause: error });
    }
  }

  async update(
    id: string,
    doctorId: string,
    data: Partial<RoleWriteData>,
    tx: PrismaClientOrTx = this.db,
  ): Promise<RoleListItem> {
    try {
      // One nested write, so the permission set is replaced atomically even
      // when the caller doesn't pass a transaction.
      const role = await tx.role.update({
        where: { id, doctor_id: doctorId },
        data: {
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.permission_ids !== undefined
            ? {
                role_permissions: {
                  deleteMany: {},
                  create: data.permission_ids.map((permission_id) => ({
                    permission_id,
                  })),
                },
              }
            : {}),
        },
        select: ROLE_SELECT,
      });
      return this.toRoleListItem(role);
    } catch (error) {
      if (isPrismaError(error, "P2025"))
        throw new NotFoundException("role not found");
      if (isPrismaError(error, "P2002"))
        throw new UniqueException("A role with this name already exists");
      throw new Error("Failed to update role", { cause: error });
    }
  }

  async delete(
    id: string,
    doctorId: string,
    tx: PrismaClientOrTx = this.db,
  ): Promise<void> {
    try {
      await tx.role.delete({ where: { id, doctor_id: doctorId } });
    } catch (error) {
      if (isPrismaError(error, "P2025"))
        throw new NotFoundException("role not found");
      throw new Error("Failed to delete role", { cause: error });
    }
  }

  private toRoleListItem(role: RoleRow): RoleListItem {
    return {
      id: role.id,
      name: role.name,
      permission_codes: role.role_permissions.map(
        ({ permission }) => permission.code,
      ),
      secretary_count: role._count.secretaries,
      created_at: role.created_at,
      updated_at: role.updated_at,
    };
  }
}

// Convenience singleton for call sites that don't need custom DI.
// For tests, construct RoleRepository with a mock PrismaClient instead.
export const roleRepository = new RoleRepository();
