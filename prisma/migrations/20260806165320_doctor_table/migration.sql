-- CreateTable
CREATE TABLE "Doctor" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "clinic_address" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);
