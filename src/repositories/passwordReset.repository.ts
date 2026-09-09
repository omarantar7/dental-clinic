import prisma from "@/lib/db";
import { Prisma } from "@/app/generated/prisma/client";
import bcrypt from "bcrypt";
import otpGenerator from "otp-generator";

type PrismaClientOrTx = typeof prisma | Prisma.TransactionClient;

export class PasswordResetRepository {
  static async createResetPasswordRequest(
    userId: string,
    expiresAt: Date,
    tx: PrismaClientOrTx = prisma,
  ): Promise<{ otp: string; id: string }> {
    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    const otpHash = await bcrypt.hash(otp, 10);

    const passwordResetRecord = await tx.passwordReset.create({
      data: {
        user_id: userId,
        expires_at: expiresAt,
        otp_code_hash: otpHash,
      },
    });

    return { otp, id: passwordResetRecord.id };
  }

  static async getLatestActiveRequest(
    userId: string,
    tx: PrismaClientOrTx = prisma,
  ) {
    return tx.passwordReset.findFirst({
      where: {
        user_id: userId,
        used_at: null,
        expires_at: { gt: new Date() },
      },
      orderBy: { created_at: "desc" },
    });
  }

  static async markVerified(
    id: string,
    tx: PrismaClientOrTx = prisma,
  ): Promise<void> {
    await tx.passwordReset.update({
      where: { id },
      data: { is_verified: true },
    });
  }

  static async getById(id: string, tx: PrismaClientOrTx = prisma) {
    const record = await tx.passwordReset.findUnique({ where: { id } });
    return record;
  }

  static async markUsed(
    id: string,
    tx: PrismaClientOrTx = prisma,
  ): Promise<void> {
    await tx.passwordReset.update({
      where: { id },
      data: { used_at: new Date() },
    });
  }
}
