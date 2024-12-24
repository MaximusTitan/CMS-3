"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  classRecordingSchema,
  ClassRecordingSchema,
} from "@/lib/formValidationSchemas";
import { createClassRecording, updateClassRecording } from "@/lib/actions";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import InputField from "../InputField";
import MultiInputField from "../multilineinputfield";

interface ClassRecordingFormProps {
  type: "create" | "update";
  data?: ClassRecordingSchema;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    batches?: { id: number; name: string }[];
    teachers?: { id: string; name: string; surname: string }[];
  };
}

export default function ClassRecordingForm({
  type,
  data,
  setOpen,
  relatedData,
}: ClassRecordingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClassRecordingSchema>({
    resolver: zodResolver(classRecordingSchema),
    defaultValues: {
      ...data,
      batchId: typeof data?.batchId === "string" ? Number(data.batchId) : data?.batchId,
    },
  });

  const router = useRouter();
  const formAction = type === "create" ? createClassRecording : updateClassRecording;

  const onSubmit = handleSubmit(async (formData) => {
    const result = await formAction({ success: false, error: false }, formData);
    if (!result.error) {
      toast(`Class recording ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  });

  const { batches = [], teachers = [] } = relatedData || {};

  return (
    <form onSubmit={onSubmit} className="p-4 flex flex-col gap-4">
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create" : "Update"} Class Recording
      </h1>
      <label>Batch</label>
      <select {...register("batchId", { valueAsNumber: true })} className="ring-1 p-2 rounded">
        {batches.map((batch) => (
          <option key={batch.id} value={batch.id}>
            {batch.name}
          </option>
        ))}
      </select>
      {errors.batchId && (
        <p className="text-xs text-red-400">{errors.batchId.message}</p>
      )}

      {/* Title */}
      <InputField
        label="Title"
        type="text"
        name="title"
        register={register}
        error={errors.title}
      />

      {/* Recording URL */}
      <InputField
        label="Recording URL"
        type="url"
        name="recordingUrl"
        register={register}
        error={errors.recordingUrl}
      />

      {/* Description */}
      <label>Description</label>
      <MultiInputField
        label="Description"
        name="description"
        register={register}
        error={errors.description}
      />

      {/* Teacher */}
      <label>Teacher</label>
      <select {...register("teacherId")} className="ring-1 p-2 rounded">
        {teachers.map((teacher) => (
          <option key={teacher.id} value={teacher.id}>
            {teacher.name} {teacher.surname}
          </option>
        ))}
      </select>
      {errors.teacherId && (
        <p className="text-xs text-red-400">{errors.teacherId.message}</p>
      )}

      <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
}
