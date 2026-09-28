import prisma from "@/lib/db";
import type { PrismaClient } from "@/app/generated/prisma/client";
import type { PrismaClientOrTx } from "@/types/db";
import type {
  IPermissionRepository,
  PermissionDefinition,
  PermissionRecord,
} from "@/types/permission";

const PERMISSION_SELECT = { id: true, code: true, description: true } as const;

export class PermissionRepository implements IPermissionRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  /**
   * Makes the `permission` table match `definitions` exactly: upserts every
   * code and deletes the rest. Deleting cascades to role_permission, which is
   * intended — a code the app no longer checks grants nothing and would only
   * show up as a meaningless checkbox in the roles UI.
   */
  async syncAll(
    definitions: ReadonlyArray<PermissionDefinition>,
  ): Promise<{ removed: number }> {
    return this.db.$transaction(async (tx) => {
      const { count } = await tx.permission.deleteMany({
        where: { code: { notIn: definitions.map(({ code }) => code) } },
      });

      for (const { code, description } of definitions) {
        await tx.permission.upsert({
          where: { code },
          create: { code, description },
          update: { description },
        });
      }

      return { removed: count };
    });
  }

  async findByCodes(
    codes: ReadonlyArray<string>,
    tx: PrismaClientOrTx = this.db,
  ): Promise<PermissionRecord[]> {
    return tx.permission.findMany({
      where: { code: { in: [...codes] } },
      select: PERMISSION_SELECT,
    });
  }
}

// Convenience singleton for call sites that don't need custom DI.
// For tests, construct PermissionRepository with a mock PrismaClient instead.
export const permissionRepository = new PermissionRepository();
