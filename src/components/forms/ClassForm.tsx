"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  batchSchema,
  BatchSchema,
} from "@/lib/formValidationSchemas";
import {
  createBatch,
  updateBatch,
} from "@/lib/actions";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import * as z from "zod";

const ClassForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData: {
    teachers: any[];
    grades: any[];
    dms: any[];
  };
}) => {
  console.log('Related Data:', relatedData); // Add this line to debug

  const {
    register,
    handleSubmit,
    setValue,
    formState, // Destructure formState directly
    watch, // Add watch to monitor form values
  } = useForm<BatchSchema>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      name: "",
      capacity: 0,
      assistantLecturerIds: [],
    }
  });

  // Debug: Watch form values
  console.log("Form values:", watch());
  console.log("Form errors:", formState.errors);

  const [submissionState, setSubmissionState] = useState({
    success: false,
    error: false,
  });

  const router = useRouter();

  const onSubmit = handleSubmit(async (formData) => {
    console.log("Submitting form data:", formData);
    try {
      // Transform empty strings to undefined for optional fields
      const cleanedData = {
        ...formData,
        gradeId: formData.gradeId || undefined,
        supervisorId: formData.supervisorId || undefined,
        dmId: formData.dmId || undefined,
        zoomLink: formData.zoomLink || undefined,
        assistantLecturerIds: formData.assistantLecturerIds || [],
      };

      console.log("Cleaned form data:", cleanedData);
      const result = await (type === "create"
        ? createBatch({ success: false, error: false }, cleanedData)
        : updateBatch({ success: false, error: false }, cleanedData));

      console.log("Submission result:", result);

      if (result.success) {
        toast.success(`Batch has been ${type === "create" ? "created" : "updated"}!`);
        setOpen(false);
        router.refresh();
      } else {
        toast.error("Something went wrong!");
        setSubmissionState({ success: false, error: true });
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to submit form");
      setSubmissionState({ success: false, error: true });
    }
  });

  useEffect(() => {
    if (data) {
      setValue("name", data.name);
      setValue("capacity", data.capacity);
      if (data.gradeId) {
        setValue("gradeId", data.gradeId);
      }
      setValue("supervisorId", data.supervisorId);
      // Update to handle DM data correctly
      setValue("dmId", data.DM?.id || data.dmId || "");
      setValue("zoomLink", data?.zoomLink?.url);
      setValue("assistantLecturerIds", 
        data.assistantLecturers?.map((t: any) => t.id) || []
      );
    }
  }, [data, setValue]);

  const { teachers, grades, dms } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new batch" : "Update the batch"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Batch name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={formState.errors?.name} // Update reference to formState.errors
        />
        <InputField
          label="Capacity"
          name="capacity"
          register={register}
          defaultValue={data?.capacity}
          error={formState.errors?.capacity} // Update reference to formState.errors
        />
        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={formState.errors?.id} // Update reference to formState.errors
            hidden
          />
        )}
        <InputField
          label="Zoom Link"
          name="zoomLink"
          register={register}
          defaultValue={data?.zoomLink?.url}
          error={formState.errors?.zoomLink} // Update reference to formState.errors
        />
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Supervisor</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("supervisorId")}
            defaultValue={data?.supervisorId}
          >
            <option value="">Select Supervisor</option>
            {teachers.map(
              (teacher: { id: string; name: string; surname: string }) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name + " " + teacher.surname}
                </option>
              )
            )}
          </select>
          {formState.errors.supervisorId?.message && ( // Update reference to formState.errors
            <p className="text-xs text-red-400">
              {formState.errors.supervisorId.message.toString()}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Assistant Lecturers</label>
          <div className="flex flex-col gap-1">
            {teachers.map(
              (teacher: { id: string; name: string; surname: string }) => (
                <label key={teacher.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={teacher.id}
                    {...register("assistantLecturerIds")}
                    defaultChecked={data?.assistantLecturers?.includes(teacher.id)}
                    className="ring-[1.5px] ring-gray-300 rounded-sm"
                  />
                  <span className="text-sm text-gray-700">
                    {teacher.name + " " + teacher.surname}
                  </span>
                </label>
              )
            )}
          </div>
          {formState.errors.assistantLecturerIds?.message && ( // Update reference to formState.errors
            <p className="text-xs text-red-400">
              {formState.errors.assistantLecturerIds.message.toString()}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Grade</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("gradeId")}
            defaultValue={data?.gradeId || ""}
          >
            <option value="">Select Grade</option>
            {grades.map((grade: { id: number; level: number }) => (
              <option
                value={grade.id}
                key={grade.id}
              >
                {grade.level}
              </option>
            ))}
          </select>
          {formState.errors.gradeId?.message && ( // Update reference to formState.errors
            <p className="text-xs text-red-400">
              {formState.errors.gradeId.message.toString()}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Delivery Manager</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("dmId")}
            defaultValue={data?.DM?.id || data?.dmId || ""}
          >
            <option value="">Select DM</option>
            {Array.isArray(dms) && dms.map((dm: { id: string; name: string; surname: string }) => (
              <option 
                key={dm.id} 
                value={dm.id}
              >
                {dm.name + " " + dm.surname}
              </option>
            ))}
          </select>
          {formState.errors.dmId?.message && ( // Update reference to formState.errors
            <p className="text-xs text-red-400">
              {formState.errors.dmId.message.toString()}
            </p>
          )}
        </div>
      </div>

      {submissionState.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}
      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default ClassForm;