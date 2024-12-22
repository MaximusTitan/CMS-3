import { z } from "zod";

export const subjectSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  teachers: z.array(z.string()), //teacher ids
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

export const batchSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Batch name is required!" }),
  capacity: z.coerce.number().min(1, { message: "Capacity is required!" }),
  gradeId: z.coerce.number().optional(), // Make gradeId optional
  supervisorId: z.coerce.string(),
  assistantLecturerIds: z.array(z.string()), // Array of assistant lecturer IDs
  dmId: z.coerce.string().optional(), // Ensure dmId is correctly defined
  zoomLink: z.string().url({ message: "Valid Zoom link is required!" }).optional(), // Zoom link (optional)
});

export type BatchSchema = z.infer<typeof batchSchema>;

export const teacherSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  subjects: z.array(z.string()).optional(), // subject ids
});

export type TeacherSchema = z.infer<typeof teacherSchema>;

export const studentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  gradeId: z.coerce.number().optional(), // Make gradeId optional
  batchId: z.coerce.number().min(1, { message: "Batch is required!" }),
});

export type StudentSchema = z.infer<typeof studentSchema>;

export const dmSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  batches: z.array(z.coerce.number()).optional(), // IDs of batches managed by DM
  createdAt: z.coerce.date().optional(),
});

export type DMSchema = z.infer<typeof dmSchema>;

export const announcementSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title of the announcement is required!" }),
  description: z.string().min(1, { message: "Short description is required!" }),
  batchId: z.coerce.number().min(1, { message: "Batch is required!" }),
  date: z.coerce.date({ message: "Valid date is required!" }),
});

export type AnnouncementSchema = z.infer<typeof announcementSchema>;

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
  subjectId: z.number({     errorMap: () => ({ message: "Subject is required" })   }),  batchId: z.number({     errorMap: () => ({ message: "Batch is required" })   }),  teacherId: z.string({     errorMap: () => ({ message: "Teacher is required" })   })});export type LessonSchema = z.infer<typeof lessonSchema>;