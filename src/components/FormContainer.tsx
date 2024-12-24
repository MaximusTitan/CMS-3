import prisma from "@/lib/prisma";
import FormModal from "./FormModal";
import { auth } from "@clerk/nextjs/server";
import { DM } from "@prisma/client"; // Import DM type

// Add proper type for relatedData
type RelatedData = {
  teachers?: { id: string; name: string; surname: string }[];
  subjects?: { id: number; name: string }[];
  grades?: { id: number; level: number }[];
  batches?: { id: number; name: string }[];
  dms?: { id: string; name: string; surname: string }[];
};

export type FormContainerProps = {
  table:
    | "teacher"
    | "student"
    | "subject"
    | "batch"
    | "lesson"
    | "event"
    | "DM"
    | "announcement"
    | "classRecording"; // Added
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
  relatedData?: RelatedData;

  // Removed 'relatedData' from props
};

const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
  let relatedData: RelatedData = {};

  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  if (type !== "delete") {
    switch (table) {
      case "subject":
        const subjectTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: subjectTeachers };
        break;
      case "batch":
        const batchGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const batchTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        const dms = await prisma.dM.findMany({
          select: { id: true, name: true, surname: true, batches: true },
        });
        relatedData = { teachers: batchTeachers, grades: batchGrades, dms: dms };
        break;
      case "teacher":
        const teacherSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        relatedData = { subjects: teacherSubjects };
        break;
      case "student":
        const studentGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const studentBatches = await prisma.batch.findMany({
          include: { _count: { select: { students: true } } },
        });
        relatedData = { batches: studentBatches, grades: studentGrades };
        break;

        case "lesson":
          const lessonsubject = await prisma.subject.findMany({
            select: { id: true, name: true }
          });
        
          const lessonbatches = await prisma.batch.findMany({
            select: { id: true, name: true }
          });
        
          const lessonteacher = await prisma.teacher.findMany({
            select: { id: true, name: true, surname: true }
          });
        relatedData = { subjects: lessonsubject, batches: lessonbatches, teachers:lessonteacher };
        break;
        
        case "DM":
          const dmbatch = await prisma.batch.findMany({
            select: { id: true, name: true },
          });
          relatedData = { batches: dmbatch };
          break;

        case "announcement":
          const batches = await prisma.batch.findMany({
            select: { id: true, name: true},
          });

          relatedData = { batches: batches };
          break;

        case "event":
          const eventBatches = await prisma.batch.findMany({
            select: { id: true, name: true },
          });
          relatedData = { batches: eventBatches };
          break;

        case "classRecording":
          const classRecordingBatches = await prisma.batch.findMany({
            select: { id: true, name: true },
          });
          const classRecordingTeachers = await prisma.teacher.findMany({
            select: { id: true, name: true, surname: true },
          });
          relatedData = { batches: classRecordingBatches, teachers: classRecordingTeachers };
          break;
      
      default:
        break;
    }
  }

  return (
    <div className="">
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData} // Pass constructed relatedData
      />
    </div>
  );
};

export default FormContainer;
