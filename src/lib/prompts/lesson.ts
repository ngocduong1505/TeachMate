import { ageGroupById, domainById } from "@/lib/curriculum";
import type { LessonRequest } from "@/lib/schemas/lesson";

export function buildLessonPrompt(req: LessonRequest) {
  const age = ageGroupById(req.ageGroup);
  const domain = domainById(req.domain);
  return `Bạn là chuyên gia giáo dục mầm non tại Việt Nam, am hiểu Chương trình giáo dục mầm non (Thông tư 01/2024/TT-BGDĐT).
Soạn một giáo án hoạt động bằng tiếng Việt, thực tế và áp dụng được ngay trong lớp.

Thông tin:
- Độ tuổi: ${age?.label ?? req.ageGroup}
- Thời lượng gợi ý: ${age?.minutes ?? "15–25"} phút
- Lĩnh vực: ${domain?.label ?? req.domain}
- Chủ đề: ${req.theme}
- Hoạt động: ${req.activity}
${req.notes ? `- Ghi chú của giáo viên: ${req.notes}` : ""}

Yêu cầu:
- Mục tiêu cụ thể, đo lường được, phù hợp độ tuổi.
- Ngôn ngữ đơn giản; có câu hỏi, lời dẫn mẫu cho cô.
- Hoạt động an toàn, không dùng vật dụng nguy hiểm.
- Phần tiến hành gồm tối thiểu: Ổn định – gây hứng thú, Nội dung (các hoạt động chính), Kết thúc.
- Không nhắc tên hay thông tin cá nhân của trẻ.`;
}
