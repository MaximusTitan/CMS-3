"use server";

import { revalidatePath } from "next/cache";
import {
  BatchSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
  AnnouncementSchema,
  DMSchema,
} from "./formValidationSchemas";
import prisma from "./prisma";
import { clerkClient } from "@clerk/nextjs/server";

type CurrentState = { success: boolean; error: boolean };

export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.subject.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createBatch = async (
  currentState: CurrentState,
  data: BatchSchema & { assistantLecturerIds?: string[] }
) => {
  try {
    const { assistantLecturerIds, ...batchData } = data;

    const batch = await prisma.batch.create({
      data: {
        ...batchData,
        assistantLecturers: assistantLecturerIds 
          ? {
              connect: assistantLecturerIds.map(id => ({ id }))
            }
          : undefined,
      },
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};


export const updateBatch = async (
  currentState: CurrentState,
  data: BatchSchema & { assistantLecturerIds?: string[] }
) => {
  try {
    const { assistantLecturerIds, ...batchData } = data;

    const batch = await prisma.batch.update({
      where: {
        id: batchData.id,
      },
      data: {
        ...batchData,
        assistantLecturers: {
          // Disconnect all current assistant lecturers
          disconnect: await prisma.batch
            .findUnique({ 
              where: { id: batchData.id }, 
              select: { assistantLecturers: { select: { id: true } } } 
            })
            .then(result => result?.assistantLecturers || []),
          
          // Connect new assistant lecturers if provided
          connect: assistantLecturerIds 
            ? assistantLecturerIds.map(id => ({ id }))
            : undefined,
        },
      },
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

// Keep other existing actions the same...
export const deleteBatch = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.batch.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};


export const createTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  try {
    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata:{role:"teacher"}
    });

    await prisma.teacher.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          connect: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const user = await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.teacher.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          set: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });
    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await clerkClient.users.deleteUser(id);

    await prisma.teacher.delete({
      where: {
        id: id,
      },
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  console.log(data);
  try {
    const classItem = await prisma.batch.findUnique({
      where: { id: data.batchId },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity === classItem._count.students) {
      return { success: false, error: true };
    }

    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata:{role:"student"}
    });

    await prisma.student.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        batchId: data.batchId,
      },
    });

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const user = await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.student.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        batchId: data.batchId,
      },
    });
    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await clerkClient.users.deleteUser(id);

    await prisma.student.delete({
      where: {
        id: id,
      },
    });

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createDM = async (
  currentState: CurrentState,
  data: DMSchema
) => {
  console.log(data);
  try {
    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "delivery_manager" },
    });

    await prisma.dM.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        sex: data.sex,
        birthday: data.birthday,
        createdAt: new Date(),
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateDM = async (
  currentState: CurrentState,
  data: DMSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const user = await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.dM.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        sex: data.sex,
        birthday: data.birthday,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteDM = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await clerkClient.users.deleteUser(id);

    await prisma.dM.delete({
      where: {
        id: id,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};


export const createAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  try {
    await prisma.announcement.create({
      data: {
        title: data.title,
        description: data.description, 
        date: data.date, 
        batch: data.batchId
          ? {
              connect: { id: data.batchId }, 
            }
          : undefined, 
      },
    });

    // Uncomment if needed to revalidate paths
    // revalidatePath("/list/announcements");

    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating announcement:", err);
    return { success: false, error: true };
  }
};

export const updateAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  try {
    await prisma.announcement.update({
      where: {
        id: data.id,
      },
      data,
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteAnnouncement = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.announcement.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};


import { z } from "zod";

// Zod schema for lesson validation (matching the client-side schema)
const lessonSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Lesson name is required"),
  day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]),
  startTime: z.string(),
  endTime: z.string(),
  subjectId: z.number(),
  batchId: z.number(),
  teacherId: z.string()
});

type LessonSchema = z.infer<typeof lessonSchema>;
type Currentstate = {
  success: boolean;
  error: boolean | string;
};

export const createLesson = async (
  currentState: CurrentState,
  formData: FormData
) => {
  try {
    // Parse form data
    const data = lessonSchema.parse({
      name: formData.get("name"),
      day: formData.get("day"),
      startTime: formData.get("startTime"),
      endTime: formData.get("endTime"),
      subjectId: Number(formData.get("subjectId")),
      batchId: Number(formData.get("batchId")),
      teacherId: formData.get("teacherId")
    });

    // Create lesson in database
    await prisma.lesson.create({
      data: {
        name: data.name,
        day: data.day,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        subject: {
          connect: { id: data.subjectId }
        },
        batch: {
          connect: { id: data.batchId }
        },
        teacher: {
          connect: { id: data.teacherId }
        }
      }
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating lesson:", err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : "An unknown error occurred" 
    };
  }
};

export const updateLesson = async (
  currentState: CurrentState,
  formData: FormData
) => {
  try {
    // Parse form data
    const data = lessonSchema.parse({
      id: Number(formData.get("id")),
      name: formData.get("name"),
      day: formData.get("day"),
      startTime: formData.get("startTime"),
      endTime: formData.get("endTime"),
      subjectId: Number(formData.get("subjectId")),
      batchId: Number(formData.get("batchId")),
      teacherId: formData.get("teacherId")
    });

    // Update lesson in database
    await prisma.lesson.update({
      where: { id: data.id },
      data: {
        name: data.name,
        day: data.day,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        subject: {
          connect: { id: data.subjectId }
        },
        batch: {
          connect: { id: data.batchId }
        },
        teacher: {
          connect: { id: data.teacherId }
        }
      }
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("Error updating lesson:", err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : "An unknown error occurred" 
    };
  }
};

export const deleteLesson = async (
  currentState: CurrentState,
  formData: FormData
) => {
  try {
    const id = Number(formData.get("id"));

    // Delete lesson from database
    await prisma.lesson.delete({
      where: { id }
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting lesson:", err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : "An unknown error occurred" 
    };
  }
};