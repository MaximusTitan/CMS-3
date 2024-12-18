/*
  Warnings:

  - You are about to drop the column `zoomLink` on the `Batch` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[zoomLinkId]` on the table `Batch` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Batch" DROP COLUMN "zoomLink",
ADD COLUMN     "zoomLinkId" INTEGER;

-- CreateTable
CREATE TABLE "ZoomLink" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "batchId" INTEGER,

    CONSTRAINT "ZoomLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ZoomLink_batchId_key" ON "ZoomLink"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "Batch_zoomLinkId_key" ON "Batch"("zoomLinkId");

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_zoomLinkId_fkey" FOREIGN KEY ("zoomLinkId") REFERENCES "ZoomLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;
