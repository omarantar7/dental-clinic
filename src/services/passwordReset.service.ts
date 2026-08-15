import { UserRepository } from "@/repositories/user.repository";
import { PasswordResetRepository } from "@/repositories/passwordReset.repository";
import config from "@/config";
import { EmailService } from "./email.service";
import { BadRequestException } from "@/exceptions/http/BadRequestException";

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

    await EmailService.sendPasswordResetOtp(
      user.email,
      resetPasswordRecord.otp,
    );
  }


}
