import z from "zod";
import { ALL_PERMISSION_CODES } from "@/config/permissions";
import type { PrismaClientOrTx } from "@/types/db";

const RoleNameSchema = z.string().trim().min(2).max(50);

// Unknown codes are rejected; duplicates (e.g. a double-submitted checkbox) are dropped.
const PermissionCodesSchema = z
  .array(z.enum(ALL_PERMISSION_CODES))
  .transform((codes) => [...new Set(codes)]);

const RoleCreateSchema = z.object({
  name: RoleNameSchema,
  permission_codes: PermissionCodesSchema,
});

const RoleUpdateSchema = z
  .object({
    name: RoleNameSchema.optional(),
    permission_codes: PermissionCodesSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

type RoleCreateInput = z.infer<typeof RoleCreateSchema>;
type RoleUpdateInput = z.infer<typeof RoleUpdateSchema>;

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
}

export { RoleCreateSchema, RoleUpdateSchema };
export type {
  RoleListItem,
  RoleWriteData,
  RoleCreateInput,
  RoleUpdateInput,
  IRoleRepository,
};
