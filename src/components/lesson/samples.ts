import type { AgeGroupId, DomainId } from "@/lib/curriculum";
import type { PlanType } from "@/lib/schemas/lesson";

export type FormValues = {
  type: PlanType;
  ageGroup: AgeGroupId;
  domain: DomainId;
  theme: string;
  branch: string;
  activity: string;
  duration: string; // số phút, "" = mặc định theo tuổi
  notes: string;
};

export const EMPTY_FORM: FormValues = {
  type: "lesson",
  ageGroup: "mg-4-5",
  domain: "nhan-thuc",
  theme: "",
  branch: "",
  activity: "",
  duration: "",
  notes: "",
};

export type Sample = { tag: string; minutes: string; title: string; className: string; values: FormValues };

const v = (p: Partial<FormValues>): FormValues => ({ ...EMPTY_FORM, ...p });

/** Gợi ý nhanh theo từng loại: bấm vào để điền sẵn form (AI vẫn soạn mới nội dung). */
export const SAMPLES: Record<PlanType, Sample[]> = {
  lesson: [
    { tag: "Nhận thức", minutes: "25–30 phút", title: "Đếm đến 5, nhận biết nhóm có 5 đối tượng, chữ số 5", className: "Mẫu giáo lớn",
      values: v({ ageGroup: "mg-5-6", domain: "nhan-thuc", theme: "Thực vật", branch: "Hoa quả mùa xuân", activity: "Đếm đến 5, nhận biết nhóm có 5 đối tượng, chữ số 5", duration: "30" }) },
    { tag: "Ngôn ngữ", minutes: "20–25 phút", title: "Truyện “Quả táo của ai” – dạy kể chuyện và đàm thoại", className: "Mẫu giáo bé",
      values: v({ ageGroup: "mg-3-4", domain: "ngon-ngu", theme: "Thế giới động vật", activity: "Truyện “Quả táo của ai” – dạy kể chuyện và đàm thoại", duration: "20" }) },
    { tag: "Thể chất", minutes: "25–30 phút", title: "Bật xa 35cm – trò chơi “Chuyền bóng”", className: "Mẫu giáo nhỡ",
      values: v({ ageGroup: "mg-4-5", domain: "the-chat", theme: "Bản thân", branch: "Cơ thể khỏe mạnh", activity: "Bật xa 35cm – trò chơi “Chuyền bóng”", duration: "25" }) },
    { tag: "Thẩm mỹ", minutes: "30–35 phút", title: "Xé dán đàn cá bơi dưới nước", className: "Mẫu giáo lớn",
      values: v({ ageGroup: "mg-5-6", domain: "tham-my", theme: "Nước và hiện tượng tự nhiên", branch: "Sinh vật dưới nước", activity: "Xé dán đàn cá bơi dưới nước", duration: "30" }) },
  ],
  corner: [
    { tag: "Hoạt động góc", minutes: "40–45 phút", title: "Chơi ở các góc – chủ đề Gia đình thân yêu", className: "Mẫu giáo nhỡ",
      values: v({ type: "corner", ageGroup: "mg-4-5", theme: "Gia đình", branch: "Gia đình thân yêu", activity: "Chơi ở các góc: phân vai, xây dựng, tạo hình, sách truyện", duration: "40" }) },
    { tag: "Hoạt động góc", minutes: "35–40 phút", title: "Góc phân vai “Bác sĩ nhí” và góc khám phá", className: "Mẫu giáo bé",
      values: v({ type: "corner", ageGroup: "mg-3-4", theme: "Nghề nghiệp", branch: "Nghề y", activity: "Góc phân vai Bác sĩ nhí, góc xây dựng bệnh viện, góc tạo hình", duration: "35" }) },
    { tag: "Hoạt động góc", minutes: "45 phút", title: "Các góc chơi chủ đề Thế giới thực vật", className: "Mẫu giáo lớn",
      values: v({ type: "corner", ageGroup: "mg-5-6", theme: "Thực vật", branch: "Vườn rau xanh", activity: "Góc phân vai Cửa hàng rau, góc thiên nhiên, góc toán, góc tạo hình", duration: "45" }) },
  ],
  outdoor: [
    { tag: "Ngoài trời", minutes: "30–35 phút", title: "Quan sát cây bàng, trò chơi “Gieo hạt”", className: "Mẫu giáo nhỡ",
      values: v({ type: "outdoor", ageGroup: "mg-4-5", domain: "nhan-thuc", theme: "Thực vật", activity: "Quan sát cây bàng; trò chơi vận động “Gieo hạt”; chơi tự do", duration: "30" }) },
    { tag: "Ngoài trời", minutes: "30 phút", title: "Thí nghiệm vật chìm, vật nổi và chơi với cát nước", className: "Mẫu giáo lớn",
      values: v({ type: "outdoor", ageGroup: "mg-5-6", domain: "nhan-thuc", theme: "Nước và hiện tượng tự nhiên", activity: "Thí nghiệm vật chìm vật nổi; trò chơi “Mưa to mưa nhỏ”; chơi với cát nước", duration: "30" }) },
    { tag: "Ngoài trời", minutes: "25–30 phút", title: "Vận động: chạy theo hướng thẳng, trò chơi “Bóng tròn to”", className: "Mẫu giáo bé",
      values: v({ type: "outdoor", ageGroup: "mg-3-4", domain: "the-chat", theme: "Bản thân", activity: "Vận động chạy theo hướng thẳng; trò chơi “Bóng tròn to”; chơi với phấn, vòng", duration: "25" }) },
  ],
  weekly: [
    { tag: "Kế hoạch tuần", minutes: "5 ngày", title: "Tuần 1 – Chủ đề nhánh: Cô giáo của em", className: "Mẫu giáo nhỡ",
      values: v({ type: "weekly", ageGroup: "mg-4-5", theme: "Trường mầm non", branch: "Cô giáo của em", activity: "" }) },
    { tag: "Kế hoạch tuần", minutes: "5 ngày", title: "Chủ đề nhánh: Con vật nuôi trong gia đình", className: "Mẫu giáo bé",
      values: v({ type: "weekly", ageGroup: "mg-3-4", theme: "Thế giới động vật", branch: "Con vật nuôi trong gia đình", activity: "" }) },
    { tag: "Kế hoạch tuần", minutes: "5 ngày", title: "Chủ đề nhánh: Tết và mùa xuân", className: "Mẫu giáo lớn",
      values: v({ type: "weekly", ageGroup: "mg-5-6", theme: "Tết và mùa xuân", branch: "Tết cổ truyền Việt Nam", activity: "" }) },
  ],
};

export const DURATIONS = ["15", "20", "25", "30", "35", "40", "45"];

/** Chữ hướng dẫn riêng cho từng loại. */
export const TYPE_HINTS: Record<PlanType, { activityLabel: string; activityPlaceholder: string; needsDomain: boolean; needsDuration: boolean; needsActivity: boolean }> = {
  lesson: {
    activityLabel: "Tên tiết học / hoạt động",
    activityPlaceholder: "Ví dụ: Phân biệt con vật nuôi trong gia đình",
    needsDomain: true, needsDuration: true, needsActivity: true,
  },
  corner: {
    activityLabel: "Các góc chơi hoặc nội dung chơi",
    activityPlaceholder: "Ví dụ: Góc phân vai Bác sĩ nhí, góc xây dựng, góc tạo hình",
    needsDomain: false, needsDuration: true, needsActivity: true,
  },
  outdoor: {
    activityLabel: "Nội dung hoạt động ngoài trời",
    activityPlaceholder: "Ví dụ: Quan sát cây bàng; trò chơi “Gieo hạt”; chơi tự do",
    needsDomain: true, needsDuration: true, needsActivity: true,
  },
  weekly: {
    activityLabel: "",
    activityPlaceholder: "",
    needsDomain: false, needsDuration: false, needsActivity: false,
  },
};
