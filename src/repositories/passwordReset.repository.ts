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
    const otp = otpGenerator.generate(4, {
      upperCaseAlphabets: false,
      specialChars: false,
      digits: true,
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


}
