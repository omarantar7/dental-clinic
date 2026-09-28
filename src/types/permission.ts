import type { PrismaClientOrTx } from "@/types/db";

export type PermissionDefinition = { code: string; description: string };

export type PermissionRecord = {
  id: string;
  code: string;
  description: string | null;
};

export interface IPermissionRepository {
  syncAll(
    definitions: ReadonlyArray<PermissionDefinition>,
  ): Promise<{ removed: number }>;
  findAll(tx?: PrismaClientOrTx): Promise<PermissionRecord[]>;
  findByCodes(
    codes: ReadonlyArray<string>,
    tx?: PrismaClientOrTx,
  ): Promise<PermissionRecord[]>;
}
