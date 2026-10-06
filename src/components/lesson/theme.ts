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
