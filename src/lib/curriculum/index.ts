export const AGE_GROUPS = [
  { id: "nha-tre", label: "Nhà trẻ (24–36 tháng)", minutes: "10–15" },
  { id: "mg-3-4", label: "Mẫu giáo bé (3–4 tuổi)", minutes: "15–20" },
  { id: "mg-4-5", label: "Mẫu giáo nhỡ (4–5 tuổi)", minutes: "20–25" },
  { id: "mg-5-6", label: "Mẫu giáo lớn (5–6 tuổi)", minutes: "25–30" },
] as const;

export const DOMAINS = [
  { id: "the-chat", label: "Phát triển thể chất" },
  { id: "nhan-thuc", label: "Phát triển nhận thức" },
  { id: "ngon-ngu", label: "Phát triển ngôn ngữ" },
  { id: "tinh-cam-xa-hoi", label: "Phát triển tình cảm và kỹ năng xã hội" },
  { id: "tham-my", label: "Phát triển thẩm mỹ" },
] as const;

export type AgeGroupId = (typeof AGE_GROUPS)[number]["id"];
export type DomainId = (typeof DOMAINS)[number]["id"];

export const ageGroupById = (id: string) => AGE_GROUPS.find((a) => a.id === id);
export const domainById = (id: string) => DOMAINS.find((d) => d.id === id);

export const PLAN_TYPE_INFO = [
  { id: "lesson", label: "Tiết học có chủ đích", short: "Tiết học", doc: "GIÁO ÁN TỔ CHỨC HOẠT ĐỘNG HỌC", desc: "Giáo án một tiết học theo lĩnh vực" },
  { id: "corner", label: "Hoạt động góc", short: "Hoạt động góc", doc: "KẾ HOẠCH HOẠT ĐỘNG GÓC", desc: "Các góc chơi, đồ dùng, cách hướng dẫn" },
  { id: "outdoor", label: "Hoạt động ngoài trời", short: "Ngoài trời", doc: "KẾ HOẠCH HOẠT ĐỘNG NGOÀI TRỜI", desc: "Quan sát, trò chơi vận động, chơi tự do" },
  { id: "weekly", label: "Kế hoạch tuần", short: "Kế hoạch tuần", doc: "KẾ HOẠCH GIÁO DỤC TUẦN", desc: "Cả tuần từ thứ Hai đến thứ Sáu" },
] as const;

export type PlanTypeId = (typeof PLAN_TYPE_INFO)[number]["id"];
export const planTypeById = (id: string) => PLAN_TYPE_INFO.find((t) => t.id === id);
