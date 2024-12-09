-- AlterTable
ALTER TABLE "Batch" ADD COLUMN     "assistantLecturerIds" TEXT[];

-- CreateTable
CREATE TABLE "_BatchAssistantLecturers" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BatchAssistantLecturers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BatchAssistantLecturers_B_index" ON "_BatchAssistantLecturers"("B");

-- AddForeignKey
ALTER TABLE "_BatchAssistantLecturers" ADD CONSTRAINT "_BatchAssistantLecturers_A_fkey" FOREIGN KEY ("A") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BatchAssistantLecturers" ADD CONSTRAINT "_BatchAssistantLecturers_B_fkey" FOREIGN KEY ("B") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
