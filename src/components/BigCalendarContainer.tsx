import prisma from "@/lib/prisma";
import BigCalendar from "./BigCalender";
import { adjustScheduleToCurrentWeek } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";

const BigCalendarContainer = async ({
  type,
  id,
}: {
  type: "teacherId" | "batchId" | "assistantLecturerId";
  id: string;
}) => {
  // Get the user's batches first if they're an assistant lecturer
  let batchIds: number[] = [];
  
  if (type === "assistantLecturerId") {
    const teacherBatches = await prisma.batch.findMany({
      where: {
        assistantLecturers: {
          some: {
            id: id
          }
        }
      },
      select: {
        id: true
      }
    });
    batchIds = teacherBatches.map(batch => batch.id);
  }

  const dataRes = await prisma.lesson.findMany({
    include: { batch: true },
    where: {
      OR: [
        ...(type === "teacherId" ? [
          { batch: { supervisorId: id } },
          { batch: { assistantLecturers: { some: { id } } } }
        ] : []),
        ...(type === "assistantLecturerId" ? [{ batchId: { in: batchIds } }] : []),
        ...(type === "batchId" ? [{ batchId: Number(id) }] : []),
      ],
    },
  });

  const data = dataRes.map((lesson) => ({
    title: `${lesson.batch?.name} - ${lesson.name}`,
    start: lesson.startTime,
    end: lesson.endTime,
  }));

  const schedule = adjustScheduleToCurrentWeek(data);

  return (
    <div style={{ height: '500px', overflow: 'auto' }}>
      <BigCalendar data={schedule} />
    </div>
  );
};

export default BigCalendarContainer;
