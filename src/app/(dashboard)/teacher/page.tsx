import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import { auth, User } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

const TeacherPage = async () => {
  const { userId } = auth();

  const classItem = await prisma.batch.findMany({
    where: {
      students: { some: { id: userId! } },
    },
  });

  console.log(classItem);
  return (
    <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Schedule</h1>
          <BigCalendarContainer type="teacherId" id={classItem[0]?.id} />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <Announcements />
      </div>
    </div>
  );
};

export default TeacherPage;
