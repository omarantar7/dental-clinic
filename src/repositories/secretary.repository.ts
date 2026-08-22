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
    data: Partial<Pick<Secretary, "doctor_id" | "role_id">>,
    tx: PrismaClientOrTx = prisma,
  ): Promise<IdentifiableSecretary> {
    try {
      const secretary = await tx.secretary.update({
        where: { id },
        data: { ...data, updated_at: new Date() },
      });
      return this.toIdentifiableSecretary(secretary);
    } catch (error: any) {
      if (error.code === "P2025")
        throw new NotFoundException("secretary not found");
      throw new Error("Failed to update secretary", { cause: error });
    }
  }

  static async deleteSecretary(
    id: string,
    tx: PrismaClientOrTx = prisma,
  ): Promise<void> {
    try {
      await tx.secretary.delete({ where: { id } });
    } catch (error: any) {
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
