import { HttpException } from "./HttpException";

export class InvalidOtpException extends HttpException {
  constructor(
    message: string = "Invalid or expired code",
    details?: Record<string, unknown>,
  ) {
    super(400, message, details);
    this.name = "InvalidOtpException";
  }
}
