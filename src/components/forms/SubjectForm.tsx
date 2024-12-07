// old method
// "use client";

// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import InputField from "../InputField";
// import { subjectSchema, SubjectSchema } from "@/lib/formValidationSchemas";
// import { createSubject, updateSubject } from "@/lib/actions";
// import { useFormState } from "react-dom";
// import { Dispatch, SetStateAction, useEffect } from "react";
// import { toast } from "react-toastify";
// import { useRouter } from "next/navigation";

// const SubjectForm = ({
//   type,
//   data,
//   setOpen,
//   relatedData,
// }: {
//   type: "create" | "update";
//   data?: any;
//   setOpen: Dispatch<SetStateAction<boolean>>;
//   relatedData?: any;
// }) => {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<SubjectSchema>({
//     resolver: zodResolver(subjectSchema),
//   });

//   // AFTER REACT 19 IT'LL BE USEACTIONSTATE

//   const [state, formAction] = useFormState(
//     type === "create" ? createSubject : updateSubject,
//     {
//       success: false,
//       error: false,
//     }
//   );

//   const onSubmit = handleSubmit((data) => {
//     console.log(data);
//     formAction(data);
//   });

//   const router = useRouter();

//   useEffect(() => {
//     if (state.success) {
//       toast(`Course has been ${type === "create" ? "created" : "updated"}!`);
//       setOpen(false);
//       router.refresh();
//     }
//   }, [state, router, type, setOpen]);

//   const { teachers } = relatedData;

//   return (
//     <form className="flex flex-col gap-8" onSubmit={onSubmit}>
//       <h1 className="text-xl font-semibold">
//         {type === "create" ? "Create a new course" : "Update the course"}
//       </h1>

//       <div className="flex justify-between flex-wrap gap-4">
//         <InputField
//           label="Course name"
//           name="name"
//           defaultValue={data?.name}
//           register={register}
//           error={errors?.name}
//         />
//         {data && (
//           <InputField
//             label="Id"
//             name="id"
//             defaultValue={data?.id}
//             register={register}
//             error={errors?.id}
//             hidden
//           />
//         )}
//         <div className="flex flex-col gap-2 w-full md:w-1/4">
//           <label className="text-xs text-gray-500">Teachers</label>
//           <select
//             multiple
//             className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
//             {...register("teachers")}
//             defaultValue={data?.teachers}
//           >
//             {teachers.map(
//               (teacher: { id: string; name: string; surname: string }) => (
//                 <option value={teacher.id} key={teacher.id}>
//                   {teacher.name + " " + teacher.surname}
//                 </option>
//               )
//             )}
//           </select>
//           {errors.teachers?.message && (
//             <p className="text-xs text-red-400">
//               {errors.teachers.message.toString()}
//             </p>
//           )}
//         </div>
//       </div>
//       {state.error && (
//         <span className="text-red-500">Something went wrong!</span>
//       )}
//       <button className="bg-blue-400 text-white p-2 rounded-md">
//         {type === "create" ? "Create" : "Update"}
//       </button>
//     </form>
//   );
// };

// export default SubjectForm;


"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { subjectSchema, SubjectSchema } from "@/lib/formValidationSchemas";
import { createSubject, updateSubject } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const SubjectForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<SubjectSchema>({
    resolver: zodResolver(subjectSchema),
  });

  const [state, formAction] = useFormState(
    type === "create" ? createSubject : updateSubject,
    {
      success: false,
      error: false,
    }
  );

  const [selectedTeachers, setSelectedTeachers] = useState<string[]>(
    type === "update" && data ? data.teachers : [] // Initialize selected teachers for update
  );

  const onSubmit = handleSubmit((data) => {
    console.log(data);
    formAction(data);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Course has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { teachers } = relatedData;

  const handleTeacherChange = (teacherId: string) => {
    setSelectedTeachers((prevSelectedTeachers) => {
      if (prevSelectedTeachers.includes(teacherId)) {
        return prevSelectedTeachers.filter((id) => id !== teacherId); // Deselect teacher
      } else {
        return [...prevSelectedTeachers, teacherId]; // Select teacher
      }
    });
  };

  // Sync selectedTeachers state with the form
  useEffect(() => {
    setValue("teachers", selectedTeachers);
  }, [selectedTeachers, setValue]);

  // If it's update, pre-populate the teacher checkboxes correctly
  useEffect(() => {
    if (type === "update" && data?.teachers) {
      setSelectedTeachers(data.teachers); // This ensures pre-selected teachers are populated in the checkboxes
    }
  }, [data, type]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new course" : "Update the course"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Course name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        />
        {type === "update" && data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Teachers</label>
          <div className="flex flex-col gap-2">
            {teachers.map((teacher: { id: string; name: string; surname: string }) => (
              <div key={teacher.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`teacher-${teacher.id}`}
                  checked={selectedTeachers.includes(teacher.id)} // Sync checkbox with selectedTeachers state
                  onChange={() => handleTeacherChange(teacher.id)}
                  className="ring-[1.5px] ring-gray-300"
                />
                <label htmlFor={`teacher-${teacher.id}`} className="text-sm">
                  {teacher.name + " " + teacher.surname}
                </label>
              </div>
            ))}
          </div>
          {errors.teachers && (
            <p className="text-xs text-red-400">{errors.teachers.message}</p>
          )}
        </div>
      </div>

      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}

      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default SubjectForm;
