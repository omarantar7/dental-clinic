import prisma from "@/lib/db";
import { UserRepository } from "@/repositories/user.repository";
import { PasswordResetRepository } from "@/repositories/passwordReset.repository";
import config from "@/config";
import { EmailService } from "./email.service";
import { passwordResetTemplate } from "@/services/email-templates/password-reset.template";
import { BadRequestException } from "@/exceptions/http/BadRequestException";
import { InvalidOtpException } from "@/exceptions/http/InvalidOtpException";
import bcrypt from "bcrypt";

export class PasswordResetService {
  static async requestReset(email: string): Promise<void> {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new BadRequestException();
    }

    const expiresAt = new Date(
      Date.now() + config.auth.otpExpirationMinutes * 60 * 1000,
    );

    const resetPasswordRecord =
      await PasswordResetRepository.createResetPasswordRequest(
        user.id,
        expiresAt,
      );

    await EmailService.sendEmail(
      user.email,
      passwordResetTemplate(
        resetPasswordRecord.otp,
        config.auth.otpExpirationMinutes,
      ),
    );
  }

  static async verifyOtp(
    email: string,
    otpCode: string,
  ): Promise<{ verified: true; reset_id: string }> {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new InvalidOtpException();
    }

    const resetRequest = await PasswordResetRepository.getLatestActiveRequest(
      user.id,
    );
    if (!resetRequest) {
      throw new InvalidOtpException();
    }

    const otpMatches = await bcrypt.compare(
      otpCode,
      resetRequest.otp_code_hash,
    );
    if (!otpMatches) {
      throw new InvalidOtpException();
    }

    await PasswordResetRepository.markVerified(resetRequest.id);

    return { verified: true, reset_id: resetRequest.id };
  }

  static async confirmNewPassword(
    resetId: string,
    newPassword: string,
  ): Promise<void> {
    const resetRequest = await PasswordResetRepository.getById(resetId);

    if (!resetRequest) {
      throw new InvalidOtpException();
    }

    if (!resetRequest.is_verified) {
      throw new InvalidOtpException();
    }

    if (resetRequest.used_at) {
      throw new InvalidOtpException();
    }

    if (resetRequest.expires_at < new Date()) {
      throw new InvalidOtpException();
    }

    await prisma.$transaction(async (tx) => {
      await UserRepository.updatePassword(
        resetRequest.user_id,
        newPassword,
        tx,
      );
      await PasswordResetRepository.markUsed(resetRequest.id, tx);
    });
  }
}
