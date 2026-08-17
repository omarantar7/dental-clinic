import { HttpException } from "./HttpException";

export class ForbiddenException extends HttpException {
  constructor(
    message: string = "Forbidden",
    details?: Record<string, unknown>,
  ) {
    super(403, message, details);
    this.name = "ForbiddenException";
  }
}
