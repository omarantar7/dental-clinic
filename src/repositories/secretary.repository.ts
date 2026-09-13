import { NotFoundException } from "@/exceptions/http/NotFoundException";
import prisma from "@/lib/db";
import { Prisma } from "@/app/generated/prisma/client";
import type {
  IdentifiableSecretary,
  Secretary,
  SecretaryListItem,
} from "@/types/secertary";
import type { ParsedListQuery } from "@/lib/helpers/query-parser";

type PrismaClientOrTx = typeof prisma | Prisma.TransactionClient;

function nestUserSearchWhere(where: Record<string, any>): Record<string, any> {
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

export class SecretaryRepository {
  static async createSecretary(
    data: Secretary,
    tx: PrismaClientOrTx = prisma,
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
    } catch (error: any) {
      throw new Error("Failed to create secretary", { cause: error });
    }
  }

  static async getSecretary(
    id: string,
    tx: PrismaClientOrTx = prisma,
  ): Promise<IdentifiableSecretary> {
    const secretary = await tx.secretary.findUnique({ where: { id } });
    if (!secretary) throw new NotFoundException("secretary not found");
    return this.toIdentifiableSecretary(secretary);
  }

  static async getSecretaryByUserId(
    userId: string,
    tx: PrismaClientOrTx = prisma,
  ): Promise<IdentifiableSecretary | null> {
    const secretary = await tx.secretary.findUnique({
      where: { user_id: userId },
    });
    return secretary ? this.toIdentifiableSecretary(secretary) : null;
  }

  static async getSecretaryProfileByUserId(
    userId: string,
    tx: PrismaClientOrTx = prisma,
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

  static async updateSecretaryProfileByUserId(
    userId: string,
    data: { phone_number?: string; full_name?: string | null },
    tx: PrismaClientOrTx = prisma,
  ): Promise<SecretaryListItem> {
    await tx.user.update({
      where: { id: userId },
      data: { ...data, updated_at: new Date() },
    });

    return this.getSecretaryProfileByUserId(userId, tx);
  }

  static async listSecretariesByDoctorId(
    doctorId: string,
    query: ParsedListQuery,
    tx: PrismaClientOrTx = prisma,
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

  static async updateSecretary(
    id: string,
    doctorId: string,
    data: {
      role_id?: string | null;
      phone_number?: string;
      full_name?: string | null;
      status?: "ENABLED" | "DISABLED" | "DELETED";
    },
    tx: PrismaClientOrTx = prisma,
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
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      if (error.code === "P2025")
        throw new NotFoundException("secretary not found");
      throw new Error("Failed to update secretary", { cause: error });
    }
  }

  static async deleteSecretary(
    id: string,
    doctorId: string,
    tx: PrismaClientOrTx = prisma,
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
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      if (error.code === "P2025")
        throw new NotFoundException("secretary not found");
      throw new Error("Failed to delete secretary", { cause: error });
    }
  }

  private static toIdentifiableSecretary(secretary: {
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
