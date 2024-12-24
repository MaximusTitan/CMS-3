import prisma from "@/lib/prisma"; // ...existing imports...
import { notFound } from "next/navigation";
import Link from "next/link";
import FormContainer from "@/components/FormContainer";
import Image from "next/image";
import Pagination from "@/components/Pagination"; // Import the Pagination component

interface ClassRecordingPageProps {
  params: {
    id: string;
  };
  searchParams?: { [key: string]: string }; // Add searchParams to props
}

interface ClassRecording {
  id: string;
  title: string;
  recordingUrl: string;
  description: string;
  teacher: {
    name: string;
    surname: string;
  };
}

export default async function ClassRecordingPage({ params, searchParams }: ClassRecordingPageProps) {
  const { id } = params;

  // Fetch batch details
  const batch = await prisma.batch.findUnique({
    where: { id: parseInt(id) },
    select: { name: true },
  });

  if (!batch) {
    notFound();
  }

  const ITEMS_PER_PAGE = 10; // Define items per page
  const currentPage = parseInt(searchParams?.page || "1"); // Get current page from searchParams

  // Fetch total count of recordings for pagination
  const totalCount = await prisma.classRecording.count({
    where: { batchId: parseInt(id) },
  });

  // Fetch recordings with pagination
  const recordings: ClassRecording[] = await prisma.classRecording.findMany({
    where: { batchId: parseInt(id) },
    include: {
      teacher: {
        select: { name: true, surname: true },
      },
    },
    take: ITEMS_PER_PAGE, // Number of items per page
    skip: ITEMS_PER_PAGE * (currentPage - 1), // Skip based on current page
  });

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE); // Calculate total pages

  const columns = [
    {
      header: "Title",
      accessor: "title",
   
    },
    {
      header: "Teacher",
      accessor: "teacher",
    },
    {
      header: "Recording URL",
      accessor: "recordingUrl",
    },
    {
      header: "Description",
      accessor: "description",
    },
    // Add more columns if needed
  ];

  const renderRow = (rec: ClassRecording) => (
    <tr key={rec.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
      <td className="p-4 text-left">{rec.title}</td>
      <td className="p-4 text-left">{`${rec.teacher.name} ${rec.teacher.surname}`}</td>
      <td className="p-4 text-left">
        <a href={rec.recordingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
          View Recording
        </a>
      </td>
      <td className="p-4 text-left">{rec.description}</td>
      {/* Add more cells if needed */}
    </tr>
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Recordings for Batch: {batch.name}</h1>

      {recordings.length > 0 ? (
        <>
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.header} className="py-2 px-4 border-b text-left">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recordings.map((rec) => renderRow(rec))}
            </tbody>
          </table>
          <Pagination page={currentPage} count={totalPages} /> {/* Add Pagination component */}
        </>
      ) : (
        <p>No recordings found for this batch.</p>
      )}
    </div>
  );
}
