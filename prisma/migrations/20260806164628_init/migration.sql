-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('DOCTOR', 'SECRETARY');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ENABLED', 'DISABLED', 'DELETED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "role" "Roles" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ENABLED',
    "email" TEXT NOT NULL,
    "full_name" TEXT,
    "password_hash" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
    "password_changed_at" TIMESTAMP(3),
    "address" TEXT,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
