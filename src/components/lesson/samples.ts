import type { AgeGroupId, DomainId } from "@/lib/curriculum";

export type FormValues = {
  ageGroup: AgeGroupId;
  domain: DomainId;
  theme: string;
  branch: string;
  activity: string;
  duration: string; // số phút, "" = mặc định theo tuổi
  notes: string;
};

export const EMPTY_FORM: FormValues = {
  ageGroup: "mg-4-5",
  domain: "nhan-thuc",
  theme: "",
  branch: "",
  activity: "",
  duration: "",
  notes: "",
};

export type Sample = { tag: string; minutes: string; title: string; className: string; values: FormValues };

/** Gợi ý nhanh: bấm vào để điền sẵn form (AI vẫn soạn mới nội dung). */
export const SAMPLES: Sample[] = [
  {
    tag: "Tiết học",
    minutes: "25–30 phút",
    title: "Đếm đến 5, nhận biết nhóm có 5 đối tượng, chữ số 5",
    className: "Mẫu giáo lớn",
    values: { ...EMPTY_FORM, ageGroup: "mg-5-6", domain: "nhan-thuc", theme: "Thực vật", branch: "Hoa quả mùa xuân", activity: "Đếm đến 5, nhận biết nhóm có 5 đối tượng, chữ số 5", duration: "30" },
  },
  {
    tag: "Văn học",
    minutes: "20–25 phút",
    title: "Truyện “Quả táo của ai” – dạy kể chuyện và đàm thoại",
    className: "Mẫu giáo bé",
    values: { ...EMPTY_FORM, ageGroup: "mg-3-4", domain: "ngon-ngu", theme: "Thế giới động vật", branch: "", activity: "Truyện “Quả táo của ai” – dạy kể chuyện và đàm thoại", duration: "20" },
  },
  {
    tag: "Thể chất",
    minutes: "25–30 phút",
    title: "Bật xa 35cm – trò chơi “Chuyền bóng”",
    className: "Mẫu giáo nhỡ",
    values: { ...EMPTY_FORM, ageGroup: "mg-4-5", domain: "the-chat", theme: "Bản thân", branch: "Cơ thể khỏe mạnh", activity: "Bật xa 35cm – trò chơi “Chuyền bóng”", duration: "25" },
  },
  {
    tag: "Tạo hình",
    minutes: "30–35 phút",
    title: "Xé dán đàn cá bơi dưới nước",
    className: "Mẫu giáo lớn",
    values: { ...EMPTY_FORM, ageGroup: "mg-5-6", domain: "tham-my", theme: "Nước và hiện tượng tự nhiên", branch: "Sinh vật dưới nước", activity: "Xé dán đàn cá bơi dưới nước", duration: "30" },
  },
];

export const DURATIONS = ["15", "20", "25", "30", "35"];
