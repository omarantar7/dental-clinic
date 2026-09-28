import {
  ALL_PERMISSION_CODES,
  PERMISSION_DESCRIPTIONS,
} from "@/config/permissions";
import { PermissionRepository } from "@/repositories/permission.repository";
import prisma from "@/lib/db";

async function main() {
  const permissionRepository = new PermissionRepository(prisma);

  const definitions = ALL_PERMISSION_CODES.map((code) => ({
    code,
    description: PERMISSION_DESCRIPTIONS[code],
  }));

  try {
    const { removed } = await permissionRepository.syncAll(definitions);
    console.log(
      `✅ Synced ${definitions.length} permissions (${removed} obsolete removed)`,
    );
  } catch (error) {
    console.error("❌ Failed to sync permissions:", error);
    // exitCode rather than exit() so the finally block still disconnects
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
