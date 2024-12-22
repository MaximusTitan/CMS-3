/*
  Warnings:

  - You are about to drop the column `dMId` on the `Batch` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Batch" DROP CONSTRAINT "Batch_dMId_fkey";

-- AlterTable
ALTER TABLE "Batch" DROP COLUMN "dMId",
ADD COLUMN     "dmId" TEXT;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_dmId_fkey" FOREIGN KEY ("dmId") REFERENCES "DM"("id") ON DELETE SET NULL ON UPDATE CASCADE;
