import type { PrismaClient } from "@/app/generated/prisma/client";
import type {
  IPermissionRepository,
  PermissionDefinition,
} from "@/types/permission";

export class PermissionRepository implements IPermissionRepository {
  constructor(private readonly db: PrismaClient) {}

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
}
