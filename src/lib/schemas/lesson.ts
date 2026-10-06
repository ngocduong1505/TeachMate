import { z } from "zod";

export const requestSchema = z.object({
  ageGroup: z.string().min(1),
  domain: z.string().min(1),
  theme: z.string().min(1).max(100),
  branch: z.string().max(100).optional(), // chủ đề nhánh / tuần
  duration: z.string().max(30).optional(), // thời lượng mong muốn, ví dụ "25 phút"
  activity: z.string().min(1).max(150),
  notes: z.string().max(500).optional(),
  fresh: z.boolean().optional(), // bỏ qua cache, tạo bản mới
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
      time: z.string().describe("Thời gian của bước, ví dụ '2–3 phút'"),
      teacherActions: z.string(),
      childrenActions: z.string(),
    }),
  ),
  extension: z.string().describe("Hoạt động mở rộng"),
});
export type Lesson = z.infer<typeof lessonSchema>;

/** Thông tin đầu trang/chữ ký của giáo án. Chỉ dùng ở trình duyệt, không gửi cho AI. */
export type DocMeta = {
  school?: string;
  className?: string;
  teacher?: string;
  date?: string; // dd/mm/yyyy
};
