import Table from "@/components/Table";
import  prisma from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/Pagination";
import { ITEM_PER_PAGE } from "@/lib/settings";
import FormContainer from "@/components/FormContainer";


type BatchList = {
  id: number;
  name: string;
};

export default async function RecordingsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string };
}) {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const p = parseInt(searchParams?.page || "1");

  // If admin, no filter; else add your user-specific logic
  const whereClause = role !== "admin"
    ? {
        // ...additional filtering logic if needed...
      }
    : {};

  const [data, totalCount] = await prisma.$transaction([
    prisma.batch.findMany({
      where: whereClause,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.batch.count({
      where: whereClause,
    }),
  ]);

  const columns = [
    { header: "Batch Name", accessor: "name" },
    {
      header: "Actions",
      accessor: "action",
    },
  ];

  const renderRow = (item: BatchList) => (
    <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
      <td className="flex items-center gap-4 p-4">
        <Link href={`/list/recordings/${item.id}`}>{item.name}</Link>
      </td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/recordings/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Past Recordings</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button type="button" className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            {(role === "admin" || role === "teacher" || role === "delivery_manager") && <FormContainer table="classRecording" type="create"  />}
            
           
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />
      <Pagination page={p} count={totalCount} />
      {/* PAGINATION or other components as needed */}
    </div>
  );
}
