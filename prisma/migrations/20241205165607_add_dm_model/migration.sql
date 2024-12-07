-- AlterTable
ALTER TABLE "Batch" ADD COLUMN     "dMId" TEXT;

-- CreateTable
CREATE TABLE "DM" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT NOT NULL,
    "img" TEXT,
    "sex" "UserSex" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "birthday" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DM_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DM_username_key" ON "DM"("username");

-- CreateIndex
CREATE UNIQUE INDEX "DM_email_key" ON "DM"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DM_phone_key" ON "DM"("phone");

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_dMId_fkey" FOREIGN KEY ("dMId") REFERENCES "DM"("id") ON DELETE SET NULL ON UPDATE CASCADE;
