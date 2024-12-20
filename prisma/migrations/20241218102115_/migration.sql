-- CreateTable
CREATE TABLE "ClassRecording" (
    "id" TEXT NOT NULL,
    "batchId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "recordingUrl" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassRecording_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ClassRecording" ADD CONSTRAINT "ClassRecording_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
