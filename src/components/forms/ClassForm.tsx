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
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
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
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BatchSchema>({
    resolver: zodResolver(batchSchema),
  });

  const [state, formAction] = useFormState(
    type === "create" ? createBatch : updateBatch,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    console.log(data);
    formAction(data);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Batch has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  useEffect(() => {
    if (data) {
      setValue("name", data.name);
      setValue("capacity", data.capacity);
      setValue("gradeId", data.gradeId);
      setValue("supervisorId", data.supervisorId);
      setValue("dmId", data.dmId);
      setValue("zoomLink", data?.zoomLink?.url);
      setValue("assistantLecturerIds", 
        data.assistantLecturers?.map((t: any) => t.id) || []
      );
    }
  }, [data, setValue]);

  const { teachers, grades } = relatedData;

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
          error={errors?.name}
        />
        <InputField
          label="Capacity"
          name="capacity"
          register={register}
          defaultValue={data?.capacity}
          error={errors?.capacity}
        />
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
        <InputField
          label="Zoom Link"
          name="zoomLink"
          register={register}
          defaultValue={data?.zoomLink?.url}
          error={errors?.zoomLink}      
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
          {errors.supervisorId?.message && (
            <p className="text-xs text-red-400">
              {errors.supervisorId.message.toString()}
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
          {errors.assistantLecturerIds?.message && (
            <p className="text-xs text-red-400">
              {errors.assistantLecturerIds.message.toString()}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Grade</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("gradeId")}
            defaultValue={data?.gradeId}
          >
            {grades.map((grade: { id: number; level: number }) => (
              <option
                value={grade.id}
                key={grade.id}
                selected={data && grade.id === data.gradeId}
              >
                {grade.level}
              </option>
            ))}
          </select>
          {errors.gradeId?.message && (
            <p className="text-xs text-red-400">
              {errors.gradeId.message.toString()}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Delivery Manager</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("dmId")}
            defaultValue={data?.dmId}
          >
            <option value="">Select DM</option>
            {relatedData?.dm?.map((dm: { id: string; name: string; surname: string }) => (
              <option key={dm.id} value={dm.id}>
                {dm.name + " " + dm.surname}
              </option>
            )) || []}
          </select>
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

export default ClassForm;