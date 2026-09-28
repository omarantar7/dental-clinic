import type { PrismaClientOrTx } from "@/types/db";

type RoleListItem = {
  id: string;
  name: string;
  permission_codes: string[];
  // Excludes soft-deleted secretaries: the doctor can't see or reassign them.
  secretary_count: number;
  created_at: Date;
  updated_at: Date;
};

type RoleWriteData = { name: string; permission_ids: string[] };

interface IRoleRepository {
  findByIdForDoctor(
    id: string,
    doctorId: string,
    tx?: PrismaClientOrTx,
  ): Promise<RoleListItem | null>;
  listByDoctor(doctorId: string, tx?: PrismaClientOrTx): Promise<RoleListItem[]>;
  create(
    doctorId: string,
    data: RoleWriteData,
    tx?: PrismaClientOrTx,
  ): Promise<RoleListItem>;
  update(
    id: string,
    doctorId: string,
    data: Partial<RoleWriteData>,
    tx?: PrismaClientOrTx,
  ): Promise<RoleListItem>;
  delete(id: string, doctorId: string, tx?: PrismaClientOrTx): Promise<void>;
  countSecretaries(id: string, tx?: PrismaClientOrTx): Promise<number>;
}

export type { RoleListItem, RoleWriteData, IRoleRepository };
