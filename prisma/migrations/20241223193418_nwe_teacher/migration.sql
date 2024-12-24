-- AddForeignKey
ALTER TABLE "ClassRecording" ADD CONSTRAINT "ClassRecording_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
