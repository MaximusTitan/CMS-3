/*
  Warnings:

  - You are about to drop the column `assistantLecturerIds` on the `Batch` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Batch" DROP CONSTRAINT "Batch_gradeId_fkey";

-- AlterTable
ALTER TABLE "Batch" DROP COLUMN "assistantLecturerIds",
ALTER COLUMN "gradeId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE SET NULL ON UPDATE CASCADE;
