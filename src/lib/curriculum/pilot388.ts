import type { AgeGroupId } from "@/lib/curriculum";

/**
 * Chương trình giáo dục mầm non thí điểm (Quyết định 388/QĐ-BGDĐT ngày 12/2/2026),
 * áp dụng thí điểm từ năm học 2026–2027 tại 510 cơ sở. Hướng dẫn: Công văn 2595/BGDĐT-GDMN.
 * Chỉ chứa định hướng chung; KHÔNG có mã chỉ số hay bảng kết quả theo độ tuổi (không tự đặt).
 */
export const PILOT_PROGRAM = {
  name: "Chương trình giáo dục mầm non thí điểm (Quyết định 388/QĐ-BGDĐT)",
  short: "CT thí điểm 388",
} as const;

export const QUALITIES = ["Yêu thương", "Tôn trọng", "Trung thực", "Trách nhiệm"] as const;

export const COMPETENCIES = ["Giao tiếp", "Hợp tác", "Thích ứng", "Tự lực", "Giải quyết vấn đề"] as const;

/** Trọng tâm năng lực nên ưu tiên theo độ tuổi (gợi ý để prompt bám sát tuổi). */
const AGE_FOCUS: Record<AgeGroupId, string> = {
  "nha-tre":
    "Trẻ 24–36 tháng: học qua giác quan, vận động và chơi lặp lại; hoạt động ngắn, một bước đơn giản; ưu tiên gắn bó yêu thương với cô, tự lực ở việc nhỏ (tự xúc ăn, cất đồ chơi), giao tiếp bằng từ và câu ngắn. Không đòi hỏi trẻ ngồi yên hay đạt kết quả cố định.",
  "mg-3-4":
    "Trẻ 3–4 tuổi: chơi song song và bắt đầu chơi cùng bạn; tự lực trong sinh hoạt hằng ngày, thích ứng với nề nếp lớp, giao tiếp bằng câu đơn giản; nhiệm vụ 1–2 bước, nhiều thao tác trực tiếp với đồ vật.",
  "mg-4-5":
    "Trẻ 4–5 tuổi: bắt đầu hợp tác trong nhóm nhỏ 2–4 trẻ, tò mò đặt câu hỏi 'vì sao', thử nhiều cách khi gặp khó; nhiệm vụ 2–3 bước, có thể chia sẻ, luân phiên.",
  "mg-5-6":
    "Trẻ 5–6 tuổi: hợp tác theo nhóm, tự lập kế hoạch việc đơn giản, giải quyết vấn đề (dự đoán, thử, kiểm tra, trình bày), giao tiếp mạch lạc; tăng tự chủ và trách nhiệm với việc chung, làm quen nề nếp chuẩn bị vào lớp 1 mà KHÔNG dạy trước chương trình lớp 1.",
};

/** Khối nội dung chèn vào prompt khi soạn theo chương trình thí điểm. */
export function pilotPromptBlock(ageGroup: AgeGroupId | string): string {
  const focus = AGE_FOCUS[ageGroup as AgeGroupId];
  return `ĐỊNH HƯỚNG THEO ${PILOT_PROGRAM.name}:
- Chuyển từ truyền thụ kiến thức sang phát triển phẩm chất và năng lực: nội dung chỉ là phương tiện, năng lực của trẻ mới là mục tiêu.
- 4 phẩm chất: ${QUALITIES.join(", ")}. 5 năng lực nền tảng: ${COMPETENCIES.join(", ")}. Giữ 5 lĩnh vực phát triển: thể chất, nhận thức, ngôn ngữ, tình cảm và kỹ năng xã hội, thẩm mỹ.
- Lấy trẻ làm trung tâm: trẻ học qua chơi, trải nghiệm, khám phá, tương tác với bạn, với đồ vật và thiên nhiên; cô là người tạo môi trường, gợi mở, quan sát và hỗ trợ, KHÔNG áp đặt một đáp án hay một cách làm duy nhất.
- Cho trẻ có lựa chọn và có thời gian tự thực hiện (chọn đồ dùng, chọn cách làm, chọn bạn cùng chơi); chấp nhận sự khác biệt giữa các trẻ, hoạt động có các mức hỗ trợ khác nhau, tạo điều kiện cho cả trẻ cần hỗ trợ đặc biệt tham gia (giáo dục hòa nhập).
- Chăm sóc – nuôi dưỡng cũng là cơ hội giáo dục: lồng ghép tự lực, giao tiếp, hợp tác vào các khoảnh khắc ăn, ngủ, vệ sinh, chuyển hoạt động.
- Đánh giá tự nhiên qua quan sát hằng ngày, ghi nhận sự tiến bộ của từng trẻ; KHÔNG xếp loại, KHÔNG so sánh trẻ với nhau, KHÔNG gây áp lực cho cô và trẻ.
- Kiến thức/kỹ năng/thái độ vẫn nêu theo từng nhóm nhưng phải thể hiện đóng góp vào năng lực, phẩm chất. Riêng mục "competencies" ghi 2–4 ý: mỗi ý nêu tên năng lực hoặc phẩm chất (chọn trong danh sách trên) và biểu hiện quan sát được của trẻ trong chính hoạt động này.
${focus ? `- Đặc điểm độ tuổi cần bám: ${focus}` : ""}`.trimEnd();
}
