import { NotFoundException } from "@/exceptions/http/NotFoundException";
import UniqueException from "@/exceptions/http/UniqueException";
import prisma from "@/lib/db";
import { Prisma } from "@/app/generated/prisma/client";
import { SafeUser, User } from "@/types/user";
import bcrypt from "bcrypt";

type PrismaClientOrTx = typeof prisma | Prisma.TransactionClient;

export class UserRepository {
  static async createUser(
    data: User,
    tx: PrismaClientOrTx = prisma,
  ): Promise<SafeUser> {
    try {
      const user = await tx.user.create({
        data: {
          role: data.role,
          email: data.email,
          full_name: data.full_name,
          password_hash: await bcrypt.hash(data.password_hash, 10),
          phone_number: data.phone_number,
          is_email_verified: false,
          address: data.address,
        },
      });

      return this.toSafeUser(user);
    } catch (error: any) {
      if (error.code === "P2002") {
        throw new UniqueException(
          "Unique constraint failed, email is already in use",
        );
      }
      throw new Error("Failed to create user", { cause: error });
    }
  }

  static async getUser(
    id: string,
    tx: PrismaClientOrTx = prisma,
  ): Promise<SafeUser> {
    const user = await tx.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException("user not found");
    }

    return this.toSafeUser(user);
  }

  static async findByEmail(email: string, tx: PrismaClientOrTx = prisma) {
    return tx.user.findUnique({ where: { email } });
  }

  static async findByEmailSafe(
    email: string,
    tx: PrismaClientOrTx = prisma,
  ): Promise<SafeUser | null> {
    const user = await tx.user.findUnique({ where: { email } });
    return user ? this.toSafeUser(user) : null;
  }

  static async listUsers(
    params: { skip?: number; take?: number; role?: string } = {},
    tx: PrismaClientOrTx = prisma,
  ): Promise<SafeUser[]> {
    const { skip = 0, take = 20, role } = params;

    const users = await tx.user.findMany({
      where: role ? { role: role as any } : undefined,
      skip,
      take,
      orderBy: { created_at: "desc" },
    });

    return users.map((u) => this.toSafeUser(u));
  }

  static async updateUser(
    id: string,
    data: Partial<
      Pick<User, "full_name" | "phone_number" | "address" | "email">
    >,
    tx: PrismaClientOrTx = prisma,
  ): Promise<SafeUser> {
    try {
      const user = await tx.user.update({
        where: { id },
        data: {
          ...data,
          updated_at: new Date(),
        },
      });

      return this.toSafeUser(user);
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new NotFoundException("user not found");
      }
      if (error.code === "P2002") {
        throw new UniqueException(
          "Unique constraint failed, email is already in use",
        );
      }
      throw new Error("Failed to update user", { cause: error });
    }
  }
  static async updatePassword(
    id: string,
    newPassword: string,
    tx: PrismaClientOrTx = prisma,
  ): Promise<void> {
    try {
      const user = await tx.user.findUnique({ where: { id } });

      if (!user) {
        throw new NotFoundException("user not found");
      }

      const isSamePassword = await bcrypt.compare(
        newPassword,
        user.password_hash,
      );

      if (isSamePassword) {
        throw new UniqueException(
          "New password must be different from the current password",
        );
      }

      await tx.user.update({
        where: { id },
        data: {
          password_hash: await bcrypt.hash(newPassword, 10),
          password_changed_at: new Date(),
          updated_at: new Date(),
        },
      });
    } catch (error: any) {
      if (
        error instanceof NotFoundException ||
        error instanceof UniqueException
      ) {
        throw error;
      }
      if (error.code === "P2025") {
        throw new NotFoundException("user not found");
      }
      throw new Error("Failed to update password", { cause: error });
    }
  }

  static async updateLastLogin(
    id: string,
    tx: PrismaClientOrTx = prisma,
  ): Promise<void> {
    await tx.user.update({
      where: { id },
      data: { last_login: new Date() },
    });
  }

  static async deleteUser(
    id: string,
    tx: PrismaClientOrTx = prisma,
  ): Promise<void> {
    try {
      await tx.user.delete({ where: { id } });
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new NotFoundException("user not found");
      }
      throw new Error("Failed to delete user", { cause: error });
    }
  }

  private static toSafeUser(user: {
    id: string;
    email: string;
    full_name: string | null;
    address: string | null;
    role: string;
    phone_number: string;
  }): SafeUser {
    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      address: user.address,
      role: user.role as SafeUser["role"],
      phone_number: user.phone_number,
    };
  }
}
