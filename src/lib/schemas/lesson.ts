import { z } from "zod";

export const requestSchema = z.object({
  ageGroup: z.string().min(1),
  domain: z.string().min(1),
  theme: z.string().min(1).max(100),
  activity: z.string().min(1).max(150),
  notes: z.string().max(500).optional(),
});
export type LessonRequest = z.infer<typeof requestSchema>;

export const lessonSchema = z.object({
  title: z.string().describe("Tên hoạt động"),
  ageGroup: z.string(),
  domain: z.string(),
  theme: z.string(),
  duration: z.string().describe("Thời lượng, ví dụ '20–25 phút'"),
  objectives: z.object({
    knowledge: z.array(z.string()).describe("Kiến thức"),
    skills: z.array(z.string()).describe("Kỹ năng"),
    attitude: z.array(z.string()).describe("Thái độ"),
  }),
  preparation: z.object({
    teacher: z.array(z.string()),
    children: z.array(z.string()),
  }),
  procedure: z.array(
    z.object({
      step: z.string().describe("Tên bước: Ổn định, Nội dung, Kết thúc..."),
      teacherActions: z.string(),
      childrenActions: z.string(),
    }),
  ),
  extension: z.string().describe("Hoạt động mở rộng"),
});
export type Lesson = z.infer<typeof lessonSchema>;
