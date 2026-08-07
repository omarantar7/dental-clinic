/*
  Warnings:

  - You are about to drop the `Doctor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('SCHEDULED', 'INPROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('UNCOMPLETED', 'COMPLETED', 'DELETED');

-- CreateEnum
CREATE TYPE "ImageOwnerType" AS ENUM ('PATIENT', 'SESSION');

-- DropTable
DROP TABLE "Doctor";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "user" (
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

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "otp_code_hash" TEXT NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permission" (
    "id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,

    CONSTRAINT "role_permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "clinic_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seceretry" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "hired_at" TIMESTAMP(3),
    "role_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seceretry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3),
    "gender" "Gender" NOT NULL,
    "address" TEXT,
    "medical_history" TEXT,
    "alergies" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ENABLED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "session_name" TEXT NOT NULL,
    "session_start_date" TIMESTAMP(3),
    "session_end_date" TIMESTAMP(3),
    "total_amount" DOUBLE PRECISION NOT NULL,
    "payment_status" "PaymentStatus",
    "status" "SessionStatus" NOT NULL DEFAULT 'UNCOMPLETED',
    "diagnosis" TEXT,
    "tooth_numbers" TEXT,
    "description" TEXT,
    "extra_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "image" (
    "id" TEXT NOT NULL,
    "owner_type" "ImageOwnerType" NOT NULL,
    "owner_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "payment_date" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "website_content" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "name" TEXT,
    "type" TEXT,
    "attrs" JSONB,
    "position" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "website_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "website_content_local" (
    "id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "language" TEXT,
    "title" TEXT,
    "attrs" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "website_content_local_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "website_seo" (
    "id" TEXT NOT NULL,
    "content_local_id" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "keywords" TEXT,
    "og_title" TEXT,
    "og_description" TEXT,
    "og_image" TEXT,
    "twitter_title" TEXT,
    "twitter_description" TEXT,
    "twitter_image" TEXT,
    "canonical_url" TEXT,
    "robots" TEXT NOT NULL DEFAULT 'index, follow',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "website_seo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "password_reset_user_id_idx" ON "password_reset"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "permission_code_key" ON "permission"("code");

-- CreateIndex
CREATE INDEX "role_doctor_id_idx" ON "role"("doctor_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_permission_role_id_permission_id_key" ON "role_permission"("role_id", "permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_user_id_key" ON "doctor"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "seceretry_user_id_key" ON "seceretry"("user_id");

-- CreateIndex
CREATE INDEX "seceretry_doctor_id_idx" ON "seceretry"("doctor_id");

-- CreateIndex
CREATE INDEX "seceretry_role_id_idx" ON "seceretry"("role_id");

-- CreateIndex
CREATE INDEX "patient_doctor_id_idx" ON "patient"("doctor_id");

-- CreateIndex
CREATE INDEX "session_patient_id_idx" ON "session"("patient_id");

-- CreateIndex
CREATE INDEX "session_doctor_id_idx" ON "session"("doctor_id");

-- CreateIndex
CREATE INDEX "image_owner_type_owner_id_idx" ON "image"("owner_type", "owner_id");

-- CreateIndex
CREATE INDEX "payment_session_id_idx" ON "payment"("session_id");

-- CreateIndex
CREATE INDEX "website_content_doctor_id_idx" ON "website_content"("doctor_id");

-- CreateIndex
CREATE INDEX "website_content_local_content_id_idx" ON "website_content_local"("content_id");

-- CreateIndex
CREATE UNIQUE INDEX "website_seo_content_local_id_key" ON "website_seo"("content_local_id");

-- AddForeignKey
ALTER TABLE "password_reset" ADD CONSTRAINT "password_reset_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor" ADD CONSTRAINT "doctor_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seceretry" ADD CONSTRAINT "seceretry_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seceretry" ADD CONSTRAINT "seceretry_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seceretry" ADD CONSTRAINT "seceretry_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient" ADD CONSTRAINT "patient_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "website_content" ADD CONSTRAINT "website_content_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "website_content_local" ADD CONSTRAINT "website_content_local_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "website_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "website_seo" ADD CONSTRAINT "website_seo_content_local_id_fkey" FOREIGN KEY ("content_local_id") REFERENCES "website_content_local"("id") ON DELETE CASCADE ON UPDATE CASCADE;
