import { NotFoundException } from "@/exceptions/http/NotFoundException";
import prisma from "@/lib/db";
import type { PrismaClient } from "@/app/generated/prisma/client";
import { isPrismaError } from "@/lib/prisma-errors";
import type { PrismaClientOrTx } from "@/types/db";
import type {
  ISecretaryRepository,
  IdentifiableSecretary,
  Secretary,
  SecretaryAccessContext,
  SecretaryListItem,
} from "@/types/secertary";
import type { DynamicWhere, ParsedListQuery } from "@/lib/helpers/query-parser";

function nestUserSearchWhere(where: DynamicWhere): DynamicWhere {
  const { AND, OR, ...fields } = where;
  const nestedFields = Object.fromEntries(
    Object.entries(fields).map(([field, condition]) => [field, condition]),
  );

  return {
    ...nestedFields,
    ...(Array.isArray(AND)
      ? { AND: AND.map((condition) => nestUserSearchWhere(condition)) }
      : {}),
    ...(Array.isArray(OR)
      ? { OR: OR.map((condition) => nestUserSearchWhere(condition)) }
      : {}),
  };
}

export class SecretaryRepository implements ISecretaryRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async createSecretary(
    data: Secretary,
    tx: PrismaClientOrTx = this.db,
  ): Promise<IdentifiableSecretary & Pick<SecretaryListItem, "created_at" | "updated_at">> {
    try {
      const createdAt = new Date();
      const secretary = await tx.secretary.create({
        data: {
          user_id: data.user_id,
          doctor_id: data.doctor_id,
          hired_at: data.hired_at ?? createdAt,
          created_at: createdAt,
          role_id: data.role_id ?? null,
        },
      });
      return {
        ...this.toIdentifiableSecretary(secretary),
        created_at: secretary.created_at,
        updated_at: secretary.updated_at,
      };
    } catch (error) {
      throw new Error("Failed to create secretary", { cause: error });
    }
  }

  async getSecretary(
    id: string,
    tx: PrismaClientOrTx = this.db,
  ): Promise<IdentifiableSecretary> {
    const secretary = await tx.secretary.findUnique({ where: { id } });
    if (!secretary) throw new NotFoundException("secretary not found");
    return this.toIdentifiableSecretary(secretary);
  }

  async getSecretaryByUserId(
    userId: string,
    tx: PrismaClientOrTx = this.db,
  ): Promise<IdentifiableSecretary | null> {
    const secretary = await tx.secretary.findUnique({
      where: { user_id: userId },
    });
    return secretary ? this.toIdentifiableSecretary(secretary) : null;
  }

  async getAccessContextByUserId(
    userId: string,
    tx: PrismaClientOrTx = this.db,
  ): Promise<SecretaryAccessContext | null> {
    const secretary = await tx.secretary.findUnique({
      where: { user_id: userId },
      select: {
        doctor_id: true,
        user: { select: { status: true } },
        role: {
          select: {
            role_permissions: {
              select: { permission: { select: { code: true } } },
            },
          },
        },
      },
    });
    if (!secretary) return null;

    return {
      doctorId: secretary.doctor_id,
      status: secretary.user.status,
      permissionCodes:
        secretary.role?.role_permissions.map(
          ({ permission }) => permission.code,
        ) ?? [],
    };
  }

  async getSecretaryProfileByUserId(
    userId: string,
    tx: PrismaClientOrTx = this.db,
  ): Promise<SecretaryListItem> {
    const secretary = await tx.secretary.findUnique({
      where: { user_id: userId },
      select: {
        id: true,
        user_id: true,
        role_id: true,
        hired_at: true,
        created_at: true,
        updated_at: true,
        user: {
          select: {
            email: true,
            phone_number: true,
            status: true,
            full_name: true,
          },
        },
        role: { select: { name: true } },
      },
    });
    if (!secretary) throw new NotFoundException("secretary not found");

    return {
      id: secretary.id,
      user_id: secretary.user_id,
      role_id: secretary.role_id,
      role_name: secretary.role?.name ?? null,
      email: secretary.user.email,
      phone_number: secretary.user.phone_number,
      full_name: secretary.user.full_name,
      status: secretary.user.status,
      hired_at: secretary.hired_at,
      created_at: secretary.created_at,
      updated_at: secretary.updated_at,
    };
  }

  async updateSecretaryProfileByUserId(
    userId: string,
    data: { phone_number?: string; full_name?: string | null },
    tx: PrismaClientOrTx = this.db,
  ): Promise<SecretaryListItem> {
    await tx.user.update({
      where: { id: userId },
      data: { ...data, updated_at: new Date() },
    });

    return this.getSecretaryProfileByUserId(userId, tx);
  }

  async listSecretariesByDoctorId(
    doctorId: string,
    query: ParsedListQuery,
    tx: PrismaClientOrTx = this.db,
  ): Promise<{
    data: SecretaryListItem[];
    page: number;
    limit: number;
    total: number;
  }> {
    const { page, limit, sortBy, sortOrder, where: searchWhere } = query;
    const where = {
      doctor_id: doctorId,
      user: {
        AND: [
          { status: { not: "DELETED" as const } },
          nestUserSearchWhere(searchWhere),
        ],
      },
    };

    const orderBy = ["email", "phone_number"].includes(sortBy)
      ? { user: { [sortBy]: sortOrder } }
      : { [sortBy]: sortOrder };

    const [secretaries, total] = await Promise.all([
      tx.secretary.findMany({
        where,
        select: {
          id: true,
          user_id: true,
          doctor_id: true,
          role_id: true,
          hired_at: true,
          created_at: true,
          updated_at: true,
          user: {
            select: {
              email: true,
              phone_number: true,
              status: true,
              full_name: true,
            },
          },
          role: { select: { name: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      tx.secretary.count({ where }),
    ]);

    return {
      data: secretaries.map((secretary) => ({
        id: secretary.id,
        user_id: secretary.user_id,
        role_id: secretary.role_id,
        full_name: secretary.user.full_name ?? null,
        role_name: secretary.role?.name ?? null,
        email: secretary.user.email,
        phone_number: secretary.user.phone_number,
        status: secretary.user.status,
        hired_at: secretary.hired_at,
        created_at: secretary.created_at,
        updated_at: secretary.updated_at,
      })),
      page,
      limit,
      total,
    };
  }

  async updateSecretary(
    id: string,
    doctorId: string,
    data: {
      role_id?: string | null;
      phone_number?: string;
      full_name?: string | null;
      status?: "ENABLED" | "DISABLED" | "DELETED";
    },
    tx: PrismaClientOrTx = this.db,
  ): Promise<SecretaryListItem> {
    try {
      const secretary = await tx.secretary.findFirst({
        where: { id, doctor_id: doctorId },
        select: { user_id: true },
      });
      if (!secretary) throw new NotFoundException("secretary not found");

      const updatedAt = new Date();
      await tx.secretary.update({
        where: { id },
        data: {
          ...(data.role_id !== undefined ? { role_id: data.role_id } : {}),
          updated_at: updatedAt,
        },
      });
      await tx.user.update({
        where: { id: secretary.user_id },
        data: {
          ...(data.phone_number !== undefined
            ? { phone_number: data.phone_number }
            : {}),
          ...(data.full_name !== undefined
            ? { full_name: data.full_name }
            : {}),
          ...(data.status !== undefined ? { status: data.status } : {}),
          updated_at: updatedAt,
        },
      });

      const updatedSecretary = await tx.secretary.findUnique({
        where: { id },
        select: {
          id: true,
          user_id: true,
          doctor_id: true,
          role_id: true,
          hired_at: true,
          created_at: true,
          updated_at: true,
          user: {
            select: {
              email: true,
              phone_number: true,
              status: true,
              full_name: true,
            },
          },
          role: { select: { name: true } },
        },
      });

      if (!updatedSecretary) throw new NotFoundException("secretary not found");

      return {
        id: updatedSecretary.id,
        user_id: updatedSecretary.user_id,
        role_id: updatedSecretary.role_id,
        role_name: updatedSecretary.role?.name ?? null,
        email: updatedSecretary.user.email,
        phone_number: updatedSecretary.user.phone_number,
        full_name: updatedSecretary.user.full_name,
        status: updatedSecretary.user.status,
        hired_at: updatedSecretary.hired_at,
        created_at: updatedSecretary.created_at,
        updated_at: updatedSecretary.updated_at,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (isPrismaError(error, "P2025"))
        throw new NotFoundException("secretary not found");
      throw new Error("Failed to update secretary", { cause: error });
    }
  }

  async deleteSecretary(
    id: string,
    doctorId: string,
    tx: PrismaClientOrTx = this.db,
  ): Promise<void> {
    try {
      const secretary = await tx.secretary.findFirst({
        where: { id, doctor_id: doctorId },
        select: { user_id: true },
      });
      if (!secretary) throw new NotFoundException("secretary not found");

      const updatedAt = new Date();
      await tx.user.update({
        where: { id: secretary.user_id },
        data: { status: "DELETED", updated_at: updatedAt },
      });
      await tx.secretary.update({
        where: { id },
        data: { updated_at: updatedAt },
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (isPrismaError(error, "P2025"))
        throw new NotFoundException("secretary not found");
      throw new Error("Failed to delete secretary", { cause: error });
    }
  }

  private toIdentifiableSecretary(secretary: {
    id: string;
    user_id: string;
    doctor_id: string;
    hired_at: Date | null;
    role_id: string | null;
  }): IdentifiableSecretary {
    return {
      id: secretary.id,
      user_id: secretary.user_id,
      doctor_id: secretary.doctor_id,
      hired_at: secretary.hired_at ?? undefined,
      role_id: secretary.role_id,
    };
  }
}

// Convenience singleton for call sites that don't need custom DI.
// For tests, construct SecretaryRepository with a mock PrismaClient instead.
export const secretaryRepository = new SecretaryRepository();
