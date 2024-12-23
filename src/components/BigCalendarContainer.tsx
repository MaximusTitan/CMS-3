import prisma from "@/lib/prisma";
import BigCalendar from "./BigCalender";
import { adjustScheduleToCurrentWeek } from "@/lib/utils";

const BigCalendarContainer = async ({
  type,
  id,
}: {
  type: "teacherId" | "batchId";
  id: string | number;
}) => {
  const dataRes = await prisma.lesson.findMany({
    where: {
      ...(type === "teacherId"
        ? { teacherId: id.toString() }
        : { batchId: parseInt(id.toString()) }),
    },
  });

  const data = dataRes.map((lesson) => ({
    title: lesson.name,
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
