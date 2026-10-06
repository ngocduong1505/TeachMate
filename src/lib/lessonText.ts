import type { Lesson } from "@/lib/schemas/lesson";

/** Văn bản thuần để sao chép dán vào Zalo, Word, Google Docs... */
export function lessonToText(l: Lesson) {
  const list = (items: string[]) => items.map((t) => `- ${t}`).join("\n");
  return [
    `GIÁO ÁN: ${l.title}`,
    `Lĩnh vực: ${l.domain} | Chủ đề: ${l.theme} | Độ tuổi: ${l.ageGroup} | Thời gian: ${l.duration}`,
    "",
    "I. MỤC ĐÍCH - YÊU CẦU",
    "1. Kiến thức",
    list(l.objectives.knowledge),
    "2. Kỹ năng",
    list(l.objectives.skills),
    "3. Thái độ",
    list(l.objectives.attitude),
    "",
    "II. CHUẨN BỊ",
    "1. Đồ dùng của cô giáo",
    list(l.preparation.teacher),
    "2. Đồ dùng của trẻ",
    list(l.preparation.children),
    "",
    "III. TIẾN TRÌNH TỔ CHỨC HOẠT ĐỘNG",
    ...l.procedure.map(
      (p, i) => `${i + 1}. ${p.step} (${p.time})\n* Hoạt động của cô:\n${p.teacherActions}\n* Hoạt động của trẻ:\n${p.childrenActions}`,
    ),
    "",
    "IV. HOẠT ĐỘNG MỞ RỘNG",
    l.extension,
  ].join("\n");
}
