"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import { createLesson, updateLesson, deleteLesson } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

// Zod schema for lesson validation (keep the same as in actions.ts)
const lessonSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Lesson name is required"),
  day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"], {
    errorMap: () => ({ message: "Please select a valid day" })
  }),
  startTime: z.string().refine(val => !isNaN(Date.parse(val)), { 
    message: "Start time is required" 
  }),
  endTime: z.string().refine(val => !isNaN(Date.parse(val)), { 
    message: "End time is required" 
  }),
  subjectId: z.number({ 
    errorMap: () => ({ message: "Subject is required" }) 
  }),
  batchId: z.number({ 
    errorMap: () => ({ message: "Batch is required" }) 
  }),
  teacherId: z.string({ 
    errorMap: () => ({ message: "Teacher is required" }) 
  })
});

type LessonSchema = z.infer<typeof lessonSchema>;

const LessonForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update" | "delete";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    subjects: { id: number; name: string }[];
    batches: { id: number; name: string }[];
    teachers: { id: string; name: string; surname: string }[];
  };
}) => {
  // Determine which action to use based on type
  const actionMap = {
    create: createLesson,
    update: updateLesson,
    delete: deleteLesson
  };
  const selectedAction = actionMap[type];

  // Initialize form with appropriate default values
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LessonSchema>({
    resolver: zodResolver(lessonSchema),
    defaultValues: data ? {
      id: data.id,
      name: data.name,
      day: data.day,
      startTime: data.startTime ? new Date(data.startTime).toISOString().slice(0, 16) : '',
      endTime: data.endTime ? new Date(data.endTime).toISOString().slice(0, 16) : '',
      subjectId: data.subjectId,
      batchId: data.batchId,
      teacherId: data.teacherId
    } : {}
  });

  // Initialize form state
  const [state, formAction] = useFormState(selectedAction, {
    success: false,
    error: null as string | null,  // Change error to be null or a string
  });

  const router = useRouter();

  // Handle form submission
  const onSubmit = handleSubmit((data) => {
    // Convert data to FormData for server action
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value?.toString() || '');
    });
    
    // Call the form action
    formAction(formData);
  });

  // Handle delete action
  const onDelete = () => {
    if (!data?.id) return;
    
    const formData = new FormData();
    formData.append('id', data.id.toString());
    
    formAction(formData);
  };

  // Handle action result
  useEffect(() => {
    if (state.success) {
      // Success message based on action type
      const actionMessages = {
        create: "Lesson created successfully!",
        update: "Lesson updated successfully!",
        delete: "Lesson deleted successfully!"
      };
      
      toast(actionMessages[type]);
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, router, type, setOpen]);

  // Render form based on type
  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" 
          ? "Create a new Lesson" 
          : type === "update" 
          ? "Update the Lesson" 
          : "Delete Lesson"}
      </h1>

      {/* Conditional rendering based on type */}
      {type !== "delete" ? (
        <>
          <div className="flex justify-between flex-wrap gap-4">
            {/* All the existing input fields from previous implementation */}
            <InputField
              label="Lesson Name"
              name="name"
              register={register}
              error={errors.name}
            />

            {/* Day Selection */}
            <div className="flex flex-col gap-2 w-full md:w-1/4">
              <label className="text-sm font-medium">Day</label>
              <select
                className="ring-1 ring-gray-300 p-2 rounded-md text-sm w-full"
                {...register("day")}
                defaultValue={data?.day || ""}
              >
                <option value="">Select Day</option>
                <option value="MONDAY">Monday</option>
                <option value="TUESDAY">Tuesday</option>
                <option value="WEDNESDAY">Wednesday</option>
                <option value="THURSDAY">Thursday</option>
                <option value="FRIDAY">Friday</option>
                <option value="SATURDAY">SATURDAY</option>
                <option value="SUNDAY">SUNDAY</option>
              </select>
              {errors.day?.message && (
                <span className="text-xs text-red-400">{errors.day.message}</span>
              )}
            </div>

            {/* Start Time */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Start Time</label>
              <input
                type="datetime-local"
                {...register("startTime")}
                className="ring-1 ring-gray-300 p-2 rounded-md text-sm w-full"
              />
              {errors.startTime?.message && (
                <span className="text-xs text-red-400">{errors.startTime.message}</span>
              )}
            </div>

            {/* End Time */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">End Time</label>
              <input
                type="datetime-local"
                {...register("endTime")}
                className="ring-1 ring-gray-300 p-2 rounded-md text-sm w-full"
              />
              {errors.endTime?.message && (
                <span className="text-xs text-red-400">{errors.endTime.message}</span>
              )}
            </div>

            {/* Subject Selection */}
            <div className="flex flex-col gap-2 w-full md:w-1/4">
              <label className="text-xs text-gray-500">Subject</label>
              <select
                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                {...register("subjectId", { valueAsNumber: true })}
                defaultValue={data?.subjectId || ""}
              >
                <option value="">Select Subject</option>
                {relatedData?.subjects?.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
              {errors.subjectId?.message && (
                <p className="text-xs text-red-400">
                  {errors.subjectId.message.toString()}
                </p>
              )}
            </div>

            {/* Batch Selection */}
            <div className="flex flex-col gap-2 w-full md:w-1/4">
              <label className="text-xs text-gray-500">Batch</label>
              <select
                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                {...register("batchId", { valueAsNumber: true })}
                defaultValue={data?.batchId || ""}
              >
                <option value="">Select Batch</option>
                {relatedData?.batches?.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name}
                  </option>
                ))}
              </select>
              {errors.batchId?.message && (
                <p className="text-xs text-red-400">
                  {errors.batchId.message.toString()}
                </p>
              )}
            </div>

            {/* Teacher Selection */}
            <div className="flex flex-col gap-2 w-full md:w-1/4">
              <label className="text-xs text-gray-500">Teacher</label>
              <select
                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                {...register("teacherId")}
                defaultValue={data?.teacherId || ""}
              >
                <option value="">Select Teacher</option>
                {relatedData?.teachers?.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name} {teacher.surname}
                  </option>
                ))}
              </select>
              {errors.teacherId?.message && (
                <p className="text-xs text-red-400">
                  {errors.teacherId.message.toString()}
                </p>
              )}
            </div>

            {data && (
              <InputField
                label="Id"
                name="id"
                defaultValue={data?.id}
                register={register}
                error={errors?.id}
                hidden
              />
            )}
          </div>
        </>
      ) : (
        // Delete confirmation
        <div className="text-center">
          <p className="text-red-500 mb-4">
            Are you sure you want to delete this lesson?
          </p>
          <p className="mb-4">
            Lesson Details:
            <br />
            Name: {data.name}
            <br />
            Batch: {data.batch?.name}
            <br />
            Subject: {data.subject?.name}
          </p>
        </div>
      )}

      {state.error && (
        <span className="text-red-500">{state.error}</span>
      )}

      <div className="flex gap-4 justify-center">
        {type === "delete" ? (
          <>
            <button 
              type="button" 
              onClick={() => setOpen(false)}
              className="bg-gray-300 text-black p-2 rounded-md"
            >
              Cancel
            </button>
            <button 
              type="button" 
              onClick={onDelete}
              className="bg-red-500 text-white p-2 rounded-md"
            >
              Confirm Delete
            </button>
          </>
        ) : (
          <button className="bg-blue-400 text-white p-2 rounded-md">
            {type === "create" ? "Create" : "Update"}
          </button>
        )}
      </div>
    </form>
  );
};

export default LessonForm;