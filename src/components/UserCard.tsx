import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";

const UserCard = async ({
  type,
}: {
  type: "admin" | "teacher" | "student";
}) => {
  const modelMap: Record<typeof type, any> = {
    admin: prisma.admin,
    teacher: prisma.teacher,
    student: prisma.student,
  };

  const data = await modelMap[type].count();

  // Map the card type to its respective link
  const hrefMap: Record<typeof type, string> = {
    admin: "/list/admins",
    teacher: "/list/teachers",
    student: "/list/students",
  };

  return (
    <Link href={hrefMap[type]} passHref>
      <div className="rounded-2xl odd:bg-lamaPurple even:bg-lamaYellow p-4 flex-1 min-w-[130px] cursor-pointer">
        <div className="flex justify-between items-center">
          <span className="text-[5px] bg-white px-2 py-0.5 rounded-full text-black">
           ------------------------------------               
          </span>
          
        </div>
        <h1 className="text-2xl font-semibold my-4">{data}</h1>
        <h2 className="capitalize text-sm font-medium text-gray-500">{type}s</h2>
      </div>
    </Link>
  );
};

export default UserCard;
