import { HttpException } from "./HttpException";

export class ConflictException extends HttpException {
  constructor(
    message: string = "Conflict",
    details?: Record<string, unknown>,
  ) {
    super(409, message, details);
    this.name = "ConflictException";
  }
}
