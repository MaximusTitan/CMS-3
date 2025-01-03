"use server";

import { revalidatePath } from "next/cache";
import {
  BatchSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
  AnnouncementSchema,
  DMSchema,
  batchSchema,
  ZoomLinkSchema,
  classRecordingSchema,
  ClassRecordingSchema,
} from "./formValidationSchemas";
import prisma from "./prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { DM } from "@prisma/client"; // Import DM type
import nodemailer from "nodemailer"; // Import nodemailer

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
    const validatedData = batchSchema.parse(data);

    const {
      name,
      capacity,
      gradeId,
      supervisorId,
      dmId,
      zoomLink,
      assistantLecturerIds,
    } = validatedData;

    await prisma.$transaction(async (prisma) => {
      let zoomLinkRecord = null;
      if (zoomLink) {
        zoomLinkRecord = await prisma.zoomLink.create({
          data: { url: zoomLink },
        });
      }

      await prisma.batch.create({
        data: {
          name,
          capacity,
          ...(gradeId && { Grade: { connect: { id: gradeId } } }),
          ...(supervisorId && { supervisor: { connect: { id: supervisorId } } }),
          ...(dmId && { DM: { connect: { id: dmId } } }),
          ...(zoomLinkRecord && { zoomLink: { connect: { id: zoomLinkRecord.id } } }),
          ...(assistantLecturerIds && assistantLecturerIds.length > 0 && {
            assistantLecturers: {
              connect: assistantLecturerIds.map(id => ({ id })),
            },
          }),
        },
      });
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating batch:", err);
    return { 
      success: false, 
      error: true,
      message: err instanceof Error ? err.message : "An unknown error occurred"
    };
  }
};

export async function updateBatch(
  prevState: CurrentState, 
  formData: BatchSchema & { assistantLecturerIds?: string[] }
) {
  try {
    const validatedFields = batchSchema.safeParse(formData);
    
    if (!validatedFields.success) {
      console.error("Validation error:", validatedFields.error);
      return { success: false, error: true };
    }

    const data = validatedFields.data;
    
    await prisma.$transaction(async (prisma) => {
      let zoomLinkRecord = null;

      if (data.zoomLink) {
        if (data.zoomLinkId) {
          // Upsert existing ZoomLink
          zoomLinkRecord = await prisma.zoomLink.upsert({
            where: { id: data.zoomLinkId },
            update: { url: data.zoomLink },
            create: { url: data.zoomLink },
          });
        } else {
          // Create new ZoomLink
          zoomLinkRecord = await prisma.zoomLink.create({
            data: { url: data.zoomLink },
          });
        }
      }

      await prisma.batch.update({
        where: { id: Number(data.id) },
        data: {
          name: data.name,
          capacity: data.capacity,
          ...(data.gradeId && { Grade: { connect: { id: data.gradeId } } }),
          supervisor: data.supervisorId
            ? { connect: { id: data.supervisorId } }
            : undefined,
          DM: data.dmId
            ? { connect: { id: data.dmId } }
            : { disconnect: true },
          ...(data.assistantLecturerIds && {
            assistantLecturers: {
              set: data.assistantLecturerIds.map(id => ({ id })),
            },
          }),
          ...(zoomLinkRecord && {
            zoomLink: { connect: { id: zoomLinkRecord.id } },
          }),
        },
      });
    });

    return { success: true, error: false };
  } catch (error) {
    console.error("Error updating batch:", error);
    return { success: false, error: true };
  }
};

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

    // revalidatePath("/list/batches");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
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
    const announcement = await prisma.announcement.create({
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

    // Fetch batch members along with course name
    const batch = await prisma.batch.findUnique({
      where: { id: data.batchId },
      include: {
        students: true,
        assistantLecturers: true,
        supervisor: true,
        DM: true,
        
      },
    });

    if (batch) {
      const emails = [
        ...batch.students.map(student => student.email).filter((email): email is string => !!email),
        ...batch.assistantLecturers.map(teacher => teacher.email).filter((email): email is string => !!email),
        batch.supervisor?.email,
        batch.DM?.email,
      ].filter((email): email is string => !!email);

      // Send emails with additional information
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: emails,
        subject: data.title, // Use title as the subject
        text: `Batch Name: ${batch.name}
        Date: ${new Intl.DateTimeFormat("en-GB").format(data.date)}
        Description: ${data.description}`,
      };

      await transporter.sendMail(mailOptions);
    }

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
type FormState = {
  success: boolean;
  error: string | null;
};

export const createLesson = async (prevState: FormState, formData: FormData): Promise<FormState> => {
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

    return { success: true, error: null };
  } catch (err) {
    console.error("Error creating lesson:", err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : "An unknown error occurred" 
    };
  }
};

export const updateLesson = async (prevState: FormState, formData: FormData): Promise<FormState> => {
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

    return { success: true, error: null };
  } catch (err) {
    console.error("Error updating lesson:", err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : "An unknown error occurred" 
    };
  }
};

export const deleteLesson = async (prevState: FormState, formData: FormData): Promise<FormState> => {
  try {
    const id = Number(formData.get("id"));

    // Delete lesson from database
    await prisma.lesson.delete({
      where: { id }
    });

    return { success: true, error: null };
  } catch (err) {
    console.error("Error deleting lesson:", err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : "An unknown error occurred" 
    };
  }
};

export const createClassRecording = async (
  currentState: CurrentState,
  data: ClassRecordingSchema
) => {
  try {
    const validatedData = classRecordingSchema.parse(data);
    await prisma.classRecording.create({
      data: {
        batchId: validatedData.batchId,
        title: validatedData.title,
        recordingUrl: validatedData.recordingUrl,
        description: validatedData.description || "",
        teacherId: validatedData.teacherId,
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating class recording:", err);
    return { success: false, error: true };
  }
};

export const updateClassRecording = async (
  currentState: CurrentState,
  data: ClassRecordingSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const validatedData = classRecordingSchema.parse(data);
    await prisma.classRecording.update({
      where: { id: data.id },
      data: {
        batchId: validatedData.batchId,
        title: validatedData.title,
        recordingUrl: validatedData.recordingUrl,
        description: validatedData.description,
        teacherId: validatedData.teacherId,
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.error("Error updating class recording:", err);
    return { success: false, error: true };
  }
};

export const deleteClassRecording = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.classRecording.delete({
      where: { id },
    });
    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting class recording:", err);
    return { success: false, error: true };
  }
};