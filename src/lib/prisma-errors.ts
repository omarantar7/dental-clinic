import { Prisma } from "@/app/generated/prisma/client";

// e.g. "P2002" unique constraint failed, "P2025" record not found
export function isPrismaError(
  error: unknown,
  code: string,
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === code
  );
}
