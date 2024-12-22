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
  supervisorId: z.coerce.string().optional(), // Ensure supervisorId is optional
  assistantLecturerIds: z.array(z.string()).optional(), // Array of assistant lecturer IDs
  dmId: z.coerce.string().optional(), // Ensure dmId is correctly defined
  zoomLink: z.string().url({ message: "Valid Zoom link is required!" }).optional(), // Zoom link (optional)
  zoomLinkId: z.coerce.number().optional(), // Add zoomLinkId as optional
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
  subjectId: z.number({     errorMap: () => ({ message: "Subject is required" })   }),  batchId: z.number({     errorMap: () => ({ message: "Batch is required" })   }),  teacherId: z.string({     errorMap: () => ({ message: "Teacher is required" })   })});

export type LessonSchema = z.infer<typeof lessonSchema>;

export const adminSchema = z.object({
  id: z.string(),
  username: z.string(),
});

export type AdminSchema = z.infer<typeof adminSchema>;

export const gradeSchema = z.object({
  id: z.number().optional(),
  level: z.number().min(1, { message: "Grade level is required!" }),
});

export type GradeSchema = z.infer<typeof gradeSchema>;

export const eventSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, { message: "Event title is required!" }),
  description: z.string().min(1, { message: "Description is required!" }),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  batchId: z.number().optional(),
});

export type EventSchema = z.infer<typeof eventSchema>;

export const zoomLinkSchema = z.object({
  id: z.number().optional(),
  url: z.string().url({ message: "Valid Zoom link is required!" }),
  batchId: z.number().optional(),
});

export type ZoomLinkSchema = z.infer<typeof zoomLinkSchema>;

export const classRecordingSchema = z.object({
  id: z.string(),
  batchId: z.number(),
  title: z.string().min(1, { message: "Recording title is required!" }),
  recordingUrl: z.string().url({ message: "Valid URL is required!" }),
  description: z.string().optional(),
  teacherId: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export type ClassRecordingSchema = z.infer<typeof classRecordingSchema>;