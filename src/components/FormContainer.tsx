import prisma from "@/lib/prisma";
import FormModal from "./FormModal";
import { auth } from "@clerk/nextjs/server";

export type FormContainerProps = {
  table:
    | "teacher"
    | "student"
    | "subject"
    | "batch"
    | "lesson"
    | "event"
    | "DM"
    | "announcement";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
};

const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
  let relatedData = {};

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
        relatedData = { teachers: batchTeachers, grades: batchGrades };
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
        relatedData = { classes: studentBatches, grades: studentGrades };
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
        relatedData={relatedData}
      />
    </div>
  );
};

export default FormContainer;
