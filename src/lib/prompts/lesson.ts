import { ageGroupById, domainById } from "@/lib/curriculum";
import type { LessonRequest } from "@/lib/schemas/lesson";

const COMMON_RULES = `- Ngôn ngữ đơn giản, thực tế, áp dụng được ngay trong lớp; có câu hỏi, lời dẫn mẫu cho cô.
- Hoạt động an toàn, không dùng vật dụng nguy hiểm, phù hợp độ tuổi.
- Trong các trường văn bản dài của cô và trẻ, mỗi ý một dòng (ngăn cách bằng ký tự xuống dòng), bắt đầu bằng "- "; lời cô nói đặt trong dấu nháy đơn; hoạt động của trẻ tương ứng từng ý của cô.
- Không nhắc tên hay thông tin cá nhân của trẻ.`;

const STEP_RULES = `- Mỗi bước trong phần tiến hành phải có thời gian cụ thể (trường "time"), tổng thời gian các bước khớp với thời lượng.`;

const TYPE_BRIEF: Record<LessonRequest["type"], { name: string; rules: string }> = {
  lesson: {
    name: "giáo án một tiết học có chủ đích",
    rules: `${STEP_RULES}
- Phần tiến hành gồm tối thiểu: Ổn định – gây hứng thú, Nội dung (các hoạt động chính), Kết thúc.
- Mục tiêu cụ thể, đo lường được.`,
  },
  corner: {
    name: "kế hoạch hoạt động góc (chơi ở các góc)",
    rules: `${STEP_RULES}
- Liệt kê 3–5 góc chơi phù hợp chủ đề và độ tuổi (ví dụ góc phân vai, góc xây dựng, góc tạo hình, góc thư viện, góc khám phá); mỗi góc có nội dung chơi, đồ dùng, cách cô hướng dẫn.
- Phần tiến hành gồm 3 bước: Thỏa thuận trước khi chơi, Quá trình chơi (cô quan sát, gợi mở, tương tác với từng góc), Nhận xét sau khi chơi.`,
  },
  outdoor: {
    name: "kế hoạch hoạt động ngoài trời",
    rules: `${STEP_RULES}
- Phần tiến hành gồm: Ổn định – kiểm tra trang phục, Hoạt động có chủ đích (quan sát hoặc thí nghiệm, hoặc vận động), Trò chơi vận động, Chơi tự do với đồ chơi ngoài trời, Kết thúc – vệ sinh.
- Phần "safety" nêu rõ các lưu ý an toàn (thời tiết, khu vực chơi, giám sát trẻ).`,
  },
  weekly: {
    name: "kế hoạch giáo dục tuần (thứ Hai đến thứ Sáu)",
    rules: `- Mục tiêu "goals" chia theo đủ 5 lĩnh vực: Phát triển thể chất, nhận thức, ngôn ngữ, tình cảm và kỹ năng xã hội, thẩm mỹ.
- "days" gồm đúng 5 ngày; mỗi ngày điền đủ: đón trẻ, thể dục sáng, hoạt động học, hoạt động ngoài trời, hoạt động góc, hoạt động chiều.
- Hoạt động học trong tuần phải phủ nhiều lĩnh vực khác nhau, không lặp lại cùng một lĩnh vực mỗi ngày; các hoạt động liên kết với chủ đề nhánh.
- Mỗi ô ngắn gọn (1–3 câu), cụ thể tên bài hát, trò chơi, truyện, bài thơ nếu có.`,
  },
};

export function buildPrompt(req: LessonRequest) {
  const age = ageGroupById(req.ageGroup);
  const domain = req.domain ? domainById(req.domain) : undefined;
  const brief = TYPE_BRIEF[req.type];
  const minutes = req.duration ?? `${age?.minutes ?? "15–25"} phút`;

  const info = [
    `- Độ tuổi: ${age?.label ?? req.ageGroup}`,
    req.type === "weekly" ? null : `- Thời lượng: ${minutes}`,
    domain ? `- Lĩnh vực: ${domain.label}` : null,
    `- Chủ đề: ${req.theme}`,
    req.branch ? `- Chủ đề nhánh / tuần: ${req.branch}` : null,
    req.activity ? `- Nội dung hoạt động: ${req.activity}` : null,
    req.notes ? `- Ghi chú của giáo viên: ${req.notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return `Bạn là chuyên gia giáo dục mầm non tại Việt Nam, am hiểu Chương trình giáo dục mầm non (Thông tư 01/2024/TT-BGDĐT).
Soạn ${brief.name} bằng tiếng Việt.

Thông tin:
${info}

Yêu cầu:
${COMMON_RULES}
${brief.rules}`;
}
