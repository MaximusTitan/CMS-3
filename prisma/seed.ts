// import { PrismaClient, UserSex, Day } from '@prisma/client';

// const prisma = new PrismaClient();

// async function main() {
//   // Seed Admin
//   const admin = await prisma.admin.create({
//     data: {
//       id: 'admin-1',
//       username: 'adminUser',
//     },
//   });

//   console.log('Admin created:', admin);

//   // Seed Grades
//   const grade1 = await prisma.grade.create({
//     data: {
//       level: 1,
//     },
//   });

//   const grade2 = await prisma.grade.create({
//     data: {
//       level: 2,
//     },
//   });

//   console.log('Grades created:', grade1, grade2);

//   // Seed Batches
//   const batch1 = await prisma.batch.create({
//     data: {
//       name: 'Batch A',
//       capacity: 30,
//       zoomlink: 'https://zoom.us/j/123456789',
//       gradeId: grade1.id,
//     },
//   });

//   const batch2 = await prisma.batch.create({
//     data: {
//       name: 'Batch B',
//       capacity: 25,
//       zoomlink: 'https://zoom.us/j/987654321',
//       gradeId: grade2.id,
//     },
//   });

//   console.log('Batches created:', batch1, batch2);

//   // Seed Teachers
//   const teacher1 = await prisma.teacher.create({
//     data: {
//       id: 'teacher-1',
//       username: 'teacher1',
//       name: 'John',
//       surname: 'Doe',
//       email: 'john.doe@example.com',
//       phone: '1234567890',
//       address: '123 Main St',
//       sex: UserSex.MALE,
//       birthday: new Date('1980-01-01'),
//     },
//   });

//   const teacher2 = await prisma.teacher.create({
//     data: {
//       id: 'teacher-2',
//       username: 'teacher2',
//       name: 'Jane',
//       surname: 'Smith',
//       email: 'jane.smith@example.com',
//       phone: '0987654321',
//       address: '456 Elm St',
//       sex: UserSex.FEMALE,
//       birthday: new Date('1985-02-02'),
//     },
//   });

//   console.log('Teachers created:', teacher1, teacher2);

//   // Seed Students
//   const student1 = await prisma.student.create({
//     data: {
//       id: 'student-1',
//       username: 'student1',
//       name: 'Alice',
//       surname: 'Johnson',
//       email: 'alice.johnson@example.com',
//       phone: '1122334455',
//       address: '789 Pine St',
//       sex: UserSex.FEMALE,
//       birthday: new Date('2010-05-15'),
//       batchId: batch1.id,
//       gradeId: grade1.id,
//     },
//   });

//   const student2 = await prisma.student.create({
//     data: {
//       id: 'student-2',
//       username: 'student2',
//       name: 'Bob',
//       surname: 'Williams',
//       email: 'bob.williams@example.com',
//       phone: '2233445566',
//       address: '101 Oak St',
//       sex: UserSex.MALE,
//       birthday: new Date('2011-07-20'),
//       batchId: batch2.id,
//       gradeId: grade2.id,
//     },
//   });

//   console.log('Students created:', student1, student2);

//   // Seed Subjects
//   const subject1 = await prisma.subject.create({
//     data: {
//       name: 'Mathematics',
//       teachers: {
//         connect: [{ id: teacher1.id }, { id: teacher2.id }],
//       },
//     },
//   });

//   const subject2 = await prisma.subject.create({
//     data: {
//       name: 'Science',
//       teachers: {
//         connect: [{ id: teacher1.id }],
//       },
//     },
//   });

//   console.log('Subjects created:', subject1, subject2);

//   // Seed Lessons
//   const lesson1 = await prisma.lesson.create({
//     data: {
//       name: 'Algebra Basics',
//       day: Day.MONDAY,
//       startTime: new Date('2024-11-27T09:00:00Z'),
//       endTime: new Date('2024-11-27T10:00:00Z'),
//       batchId: batch1.id,
//       teacherId: teacher1.id,
//       subjectId: subject1.id,
//     },
//   });

//   const lesson2 = await prisma.lesson.create({
//     data: {
//       name: 'Physics Fundamentals',
//       day: Day.TUESDAY,
//       startTime: new Date('2024-11-28T11:00:00Z'),
//       endTime: new Date('2024-11-28T12:00:00Z'),
//       batchId: batch2.id,
//       teacherId: teacher2.id,
//       subjectId: subject2.id,
//     },
//   });

//   console.log('Lessons created:', lesson1, lesson2);

//   // Seed Events
//   const event1 = await prisma.event.create({
//     data: {
//       title: 'Sports Day',
//       description: 'Annual Sports Event',
//       startTime: new Date('2024-12-01T08:00:00Z'),
//       endTime: new Date('2024-12-01T17:00:00Z'),
//       batchId: batch1.id,
//     },
//   });

//   console.log('Event created:', event1);

//   // Seed Announcements
//   const announcement1 = await prisma.announcement.create({
//     data: {
//       title: 'Exam Schedule',
//       description: 'Final exams start on Dec 15.',
//       date: new Date('2024-11-30'),
//       batchId: batch2.id,
//     },
//   });

//   console.log('Announcement created:', announcement1);

//   console.log('Seeding complete!');
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
