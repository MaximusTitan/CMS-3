import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import { auth, User } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { Batch } from "@prisma/client";

const TeacherPage = async () => {
  const { userId } = auth();

  const batches = await prisma.batch.findMany({
    where: {
      OR: [
        { supervisorId: userId! },
        { assistantLecturers: { some: { id: userId! } } },
      ],
    },
    include: { zoomLink: true },
  });

  console.log(batches);
  return (
    <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Schedule</h1>
          {batches.map((batch) => (
            <div key={batch.id} className="mt-4">
              <h2 className="text-lg font-medium">{batch.name}</h2>
              <a href={batch.zoomLink?.url} target="_blank" rel="noopener noreferrer">
                <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
                  Join Zoom Meeting
                </button>
              </a>
            </div>
          ))}
          <BigCalendarContainer
            type="teacherId"
            id={userId!}
          />
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
