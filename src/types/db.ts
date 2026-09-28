import type { Prisma, PrismaClient } from "@/app/generated/prisma/client";

// Lets repository methods run standalone or inside a caller's $transaction.
export type PrismaClientOrTx = PrismaClient | Prisma.TransactionClient;
