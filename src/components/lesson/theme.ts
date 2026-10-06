import type { PlanType } from "@/lib/schemas/lesson";
import type { AgeGroupId, DomainId } from "@/lib/curriculum";

/** Màu và biểu tượng riêng cho từng lĩnh vực (class Tailwind phải viết đầy đủ để không bị purge). */
export const DOMAIN_STYLE: Record<
  DomainId,
  { emoji: string; ring: string; bg: string; chip: string; header: string; blurb: string }
> = {
  "the-chat": {
    emoji: "🏃", ring: "ring-orange-100 border-orange-300", bg: "bg-orange-50",
    chip: "bg-orange-100 text-orange-800", header: "from-orange-400 to-amber-400",
    blurb: "Vận động, sức khỏe",
  },
  "nhan-thuc": {
    emoji: "🔍", ring: "ring-sky-100 border-sky-300", bg: "bg-sky-50",
    chip: "bg-sky-100 text-sky-800", header: "from-sky-400 to-cyan-400",
    blurb: "Khám phá, toán, tự nhiên",
  },
  "ngon-ngu": {
    emoji: "📖", ring: "ring-violet-100 border-violet-300", bg: "bg-violet-50",
    chip: "bg-violet-100 text-violet-800", header: "from-violet-400 to-fuchsia-400",
    blurb: "Truyện, thơ, giao tiếp",
  },
  "tinh-cam-xa-hoi": {
    emoji: "💞", ring: "ring-rose-100 border-rose-300", bg: "bg-rose-50",
    chip: "bg-rose-100 text-rose-800", header: "from-rose-400 to-pink-400",
    blurb: "Cảm xúc, kỹ năng sống",
  },
  "tham-my": {
    emoji: "🎨", ring: "ring-amber-100 border-amber-300", bg: "bg-amber-50",
    chip: "bg-amber-100 text-amber-800", header: "from-amber-400 to-yellow-400",
    blurb: "Âm nhạc, tạo hình",
  },
};

export const AGE_EMOJI: Record<AgeGroupId, string> = {
  "nha-tre": "🍼",
  "mg-3-4": "🧸",
  "mg-4-5": "🎈",
  "mg-5-6": "🎒",
};

export const THEME_SUGGESTIONS = [
  "Bản thân", "Gia đình", "Trường mầm non", "Thế giới động vật", "Thực vật",
  "Giao thông", "Nghề nghiệp", "Hiện tượng tự nhiên", "Tết và mùa xuân", "Quê hương, Bác Hồ",
];

/** "Phát triển thể chất" -> "Thể chất" */
export const shortDomainLabel = (label: string) => {
  const s = label.replace("Phát triển ", "");
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/** Màu/biểu tượng riêng cho từng loại kế hoạch. */
export const TYPE_STYLE: Record<
  PlanType,
  { emoji: string; header: string; tile: string; tileOn: string; chip: string }
> = {
  lesson: {
    emoji: "📖", header: "from-sky-400 to-cyan-400", tile: "bg-sky-50",
    tileOn: "border-sky-400 ring-sky-100", chip: "bg-sky-100 text-sky-800",
  },
  corner: {
    emoji: "🧩", header: "from-rose-400 to-pink-400", tile: "bg-rose-50",
    tileOn: "border-rose-400 ring-rose-100", chip: "bg-rose-100 text-rose-800",
  },
  outdoor: {
    emoji: "🌳", header: "from-lime-500 to-emerald-400", tile: "bg-emerald-50",
    tileOn: "border-emerald-400 ring-emerald-100", chip: "bg-emerald-100 text-emerald-800",
  },
  weekly: {
    emoji: "🗓️", header: "from-indigo-400 to-violet-400", tile: "bg-violet-50",
    tileOn: "border-violet-400 ring-violet-100", chip: "bg-violet-100 text-violet-800",
  },
};

/** Các phần của từng loại, dùng cho thanh tiến trình khi AI đang viết. */
export const STEPS_BY_TYPE: Record<PlanType, { key: string; label: string; emoji: string }[]> = {
  lesson: [
    { key: "objectives", label: "Mục tiêu", emoji: "🎯" },
    { key: "preparation", label: "Chuẩn bị", emoji: "🧺" },
    { key: "procedure", label: "Tiến hành", emoji: "🎪" },
    { key: "extension", label: "Mở rộng", emoji: "🌱" },
  ],
  corner: [
    { key: "objectives", label: "Mục tiêu", emoji: "🎯" },
    { key: "preparation", label: "Chuẩn bị", emoji: "🧺" },
    { key: "corners", label: "Các góc chơi", emoji: "🧩" },
    { key: "procedure", label: "Tiến hành", emoji: "🎪" },
  ],
  outdoor: [
    { key: "objectives", label: "Mục tiêu", emoji: "🎯" },
    { key: "preparation", label: "Chuẩn bị", emoji: "🧺" },
    { key: "safety", label: "An toàn", emoji: "🦺" },
    { key: "procedure", label: "Tiến hành", emoji: "🎪" },
  ],
  weekly: [
    { key: "goals", label: "Mục tiêu", emoji: "🎯" },
    { key: "preparation", label: "Chuẩn bị", emoji: "🧺" },
    { key: "days", label: "Các ngày", emoji: "🗓️" },
    { key: "notes", label: "Ghi chú", emoji: "📝" },
  ],
};
