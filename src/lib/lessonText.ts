import type { Lesson } from "@/lib/schemas/lesson";

/** Văn bản thuần để sao chép dán vào Zalo, Word, Google Docs... */
export function lessonToText(l: Lesson) {
  const list = (items: string[]) => items.map((t) => `- ${t}`).join("\n");
  return [
    `GIÁO ÁN: ${l.title}`,
    `Lĩnh vực: ${l.domain} | Chủ đề: ${l.theme} | Độ tuổi: ${l.ageGroup} | Thời gian: ${l.duration}`,
    "",
    "I. MỤC ĐÍCH YÊU CẦU",
    "1. Kiến thức",
    list(l.objectives.knowledge),
    "2. Kỹ năng",
    list(l.objectives.skills),
    "3. Thái độ",
    list(l.objectives.attitude),
    "",
    "II. CHUẨN BỊ",
    "1. Của cô",
    list(l.preparation.teacher),
    "2. Của trẻ",
    list(l.preparation.children),
    "",
    "III. TIẾN HÀNH",
    ...l.procedure.map((p) => `* ${p.step}\n  Cô: ${p.teacherActions}\n  Trẻ: ${p.childrenActions}`),
    "",
    "IV. MỞ RỘNG",
    l.extension,
  ].join("\n");
}
