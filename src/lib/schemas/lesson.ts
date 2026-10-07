import type { ExportTemplate } from "@/lib/exportTemplate";
import { z } from "zod";

export const PLAN_TYPES = ["lesson", "corner", "outdoor", "weekly"] as const;
export type PlanType = (typeof PLAN_TYPES)[number];

export const requestSchema = z
  .object({
    type: z.enum(PLAN_TYPES).default("lesson"),
    ageGroup: z.string().min(1),
    domain: z.string().max(40).optional(), // chỉ dùng cho tiết học và hoạt động ngoài trời
    theme: z.string().min(1).max(100),
    branch: z.string().max(100).optional(), // chủ đề nhánh / tuần
    duration: z.string().max(30).optional(), // thời lượng mong muốn, ví dụ "25 phút"
    activity: z.string().max(150).optional(), // không cần với kế hoạch tuần
    notes: z.string().max(500).optional(),
    classInfo: z.string().max(300).optional(), // sĩ số, đặc điểm lớp (từ hồ sơ lớp)
    fresh: z.boolean().optional(), // bỏ qua cache, tạo bản mới
    // Chỉnh sửa bản đã có: gửi kèm bản hiện tại và yêu cầu của cô. Kết quả không dùng cache.
    revise: z
      .object({
        plan: z.record(z.string(), z.unknown()),
        instruction: z.string().trim().min(1).max(500),
      })
      .optional(),
  })
  .superRefine((v, ctx) => {
    if (v.type !== "weekly" && !v.activity?.trim()) {
      ctx.addIssue({ code: "custom", path: ["activity"], message: "Thiếu tên hoạt động" });
    }
    if ((v.type === "lesson" || v.type === "outdoor") && !v.domain) {
      ctx.addIssue({ code: "custom", path: ["domain"], message: "Thiếu lĩnh vực" });
    }
  });
export type LessonRequest = z.infer<typeof requestSchema>;

const stepSchema = z.object({
  step: z.string().describe("Tên bước, ví dụ: Ổn định – gây hứng thú, Nội dung, Kết thúc"),
  time: z.string().describe("Thời gian của bước, ví dụ '2–3 phút'"),
  teacherActions: z.string().describe("Hoạt động của cô, mỗi ý một dòng, bắt đầu bằng '- '"),
  childrenActions: z.string().describe("Hoạt động của trẻ, mỗi ý một dòng, bắt đầu bằng '- '"),
});

const objectivesSchema = z.object({
  knowledge: z.array(z.string()).describe("Kiến thức"),
  skills: z.array(z.string()).describe("Kỹ năng"),
  attitude: z.array(z.string()).describe("Thái độ"),
});

const preparationSchema = z.object({
  teacher: z.array(z.string()),
  children: z.array(z.string()),
});

const head = {
  title: z.string().describe("Tên hoạt động / kế hoạch"),
  ageGroup: z.string(),
  domain: z.string().describe("Lĩnh vực phát triển (hoặc 'Tích hợp các lĩnh vực')"),
  theme: z.string(),
  duration: z.string().describe("Thời lượng, ví dụ '20–25 phút'"),
};

/** Tiết học có chủ đích. */
export const lessonSchema = z.object({
  ...head,
  objectives: objectivesSchema,
  preparation: preparationSchema,
  procedure: z.array(stepSchema),
  extension: z.string().describe("Hoạt động mở rộng"),
});
export type Lesson = z.infer<typeof lessonSchema>;

/** Kế hoạch hoạt động góc. */
export const cornerSchema = z.object({
  ...head,
  objectives: objectivesSchema,
  preparation: preparationSchema,
  corners: z
    .array(
      z.object({
        name: z.string().describe("Tên góc, ví dụ: Góc phân vai"),
        content: z.string().describe("Nội dung chơi, vai chơi"),
        materials: z.array(z.string()).describe("Đồ dùng, nguyên vật liệu của góc"),
        teacherGuide: z.string().describe("Cách cô hướng dẫn, gợi mở khi trẻ chơi"),
      }),
    )
    .describe("3–5 góc chơi"),
  procedure: z.array(stepSchema).describe("Thỏa thuận trước khi chơi, quá trình chơi, nhận xét sau khi chơi"),
  extension: z.string().describe("Gợi ý mở rộng, thay đổi góc chơi cho những ngày sau"),
});
export type CornerPlan = z.infer<typeof cornerSchema>;

/** Kế hoạch hoạt động ngoài trời. */
export const outdoorSchema = z.object({
  ...head,
  objectives: objectivesSchema,
  preparation: preparationSchema,
  safety: z.array(z.string()).describe("Lưu ý an toàn khi tổ chức ngoài trời"),
  procedure: z.array(stepSchema).describe("Ổn định, hoạt động có chủ đích, trò chơi vận động, chơi tự do, kết thúc"),
  extension: z.string().describe("Gợi ý mở rộng"),
});
export type OutdoorPlan = z.infer<typeof outdoorSchema>;

/** Kế hoạch tuần (thứ Hai đến thứ Sáu). */
export const weeklySchema = z.object({
  title: z.string().describe("Tên kế hoạch, ví dụ: Kế hoạch tuần 2 – chủ đề nhánh ..."),
  ageGroup: z.string(),
  theme: z.string(),
  branch: z.string().describe("Chủ đề nhánh / tên tuần"),
  goals: z
    .array(
      z.object({
        domain: z.string().describe("Lĩnh vực phát triển"),
        content: z.array(z.string()).describe("Mục tiêu cụ thể của tuần cho lĩnh vực này"),
      }),
    )
    .describe("Mục tiêu theo 5 lĩnh vực phát triển"),
  preparation: z.array(z.string()).describe("Chuẩn bị chung của cô và trẻ cho cả tuần"),
  days: z
    .array(
      z.object({
        day: z.string().describe("Thứ Hai ... Thứ Sáu"),
        welcome: z.string().describe("Đón trẻ, trò chuyện"),
        morningExercise: z.string().describe("Thể dục sáng"),
        learning: z.string().describe("Hoạt động học (tên tiết học, lĩnh vực)"),
        outdoor: z.string().describe("Hoạt động ngoài trời"),
        corners: z.string().describe("Hoạt động góc"),
        afternoon: z.string().describe("Hoạt động chiều"),
      }),
    )
    .describe("5 ngày từ thứ Hai đến thứ Sáu"),
  notes: z.string().describe("Phối hợp với phụ huynh, lưu ý, đánh giá cuối tuần"),
});
export type WeeklyPlan = z.infer<typeof weeklySchema>;

export type Plan = Lesson | CornerPlan | OutdoorPlan | WeeklyPlan;

export const schemaByType = {
  lesson: lessonSchema,
  corner: cornerSchema,
  outdoor: outdoorSchema,
  weekly: weeklySchema,
} as const satisfies Record<PlanType, z.ZodType>;

export type DeepPartial<T> = T extends (infer U)[]
  ? DeepPartial<U>[]
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

/** Thông tin đầu trang/chữ ký của giáo án. Chỉ dùng ở trình duyệt, không gửi cho AI. */
export type DocMeta = {
  school?: string;
  group?: string; // tổ / khối chuyên môn
  className?: string;
  teacher?: string;
  date?: string; // dd/mm/yyyy
  template?: ExportTemplate; // mẫu xuất theo trường
};
