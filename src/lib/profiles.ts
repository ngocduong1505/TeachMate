import { currentUserId, getSupabase } from "@/lib/supabase";

/** Hồ sơ lớp theo năm học. Khách: localStorage; đã đăng nhập: bảng `class_profiles` trên Supabase. */
export type Profile = {
  schoolYear: string; // "2025-2026"
  school: string;
  group: string;
  className: string;
  teacher: string;
  classSize: string; // số trẻ
  classTraits: string; // đặc điểm lớp, gửi cho AI để soạn sát thực tế
};

const KEY = "teachmate.profiles";
const LEGACY_KEY = "teachmate.profile"; // bản cũ: một hồ sơ duy nhất

/** Năm học hiện tại: từ tháng 8 là năm học mới. */
export function currentSchoolYear(now = new Date()) {
  const y = now.getFullYear();
  return now.getMonth() >= 7 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

export const emptyProfile = (schoolYear: string): Profile => ({
  schoolYear,
  school: "",
  group: "",
  className: "",
  teacher: "",
  classSize: "",
  classTraits: "",
});

/** Gộp sĩ số và đặc điểm lớp thành một đoạn mô tả ngắn gửi cho AI. */
export function profileToClassInfo(p: Profile) {
  const size = p.classSize.trim() ? `Lớp có ${p.classSize.trim()} trẻ.` : "";
  const text = [size, p.classTraits.trim()].filter(Boolean).join(" ");
  return text ? text.slice(0, 300) : undefined;
}

export function readLocalProfiles(): Profile[] {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (Array.isArray(list)) return list.map((p) => ({ ...emptyProfile(p.schoolYear), ...p }));
    const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) ?? "null");
    if (legacy) return [{ ...emptyProfile(currentSchoolYear()), ...legacy }];
  } catch {
    /* chế độ riêng tư hoặc dữ liệu hỏng: dùng danh sách rỗng */
  }
  return [];
}

function writeLocalProfiles(list: Profile[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* bỏ qua */
  }
}

type Row = { school_year: string; data: Partial<Profile> };

export async function listProfiles(): Promise<Profile[]> {
  if (await currentUserId()) {
    const { data, error } = await (await getSupabase()).from("class_profiles").select("school_year, data");
    if (error) throw error;
    return (data as Row[]).map((r) => ({ ...emptyProfile(r.school_year), ...r.data, schoolYear: r.school_year }));
  }
  return readLocalProfiles();
}

export async function saveProfile(p: Profile) {
  if (await currentUserId()) {
    const { error } = await (await getSupabase())
      .from("class_profiles")
      .upsert({ school_year: p.schoolYear, data: p, updated_at: new Date().toISOString() }, { onConflict: "user_id,school_year" });
    if (error) throw error;
    return;
  }
  const list = readLocalProfiles().filter((x) => x.schoolYear !== p.schoolYear);
  writeLocalProfiles([...list, p]);
}

/** Sau khi đăng nhập: đưa hồ sơ trên máy lên tài khoản (không ghi đè năm học đã có) rồi xóa bản cục bộ. */
export async function migrateLocalProfiles() {
  const local = readLocalProfiles();
  if (!local.length || !(await currentUserId())) return;
  const { error } = await (await getSupabase())
    .from("class_profiles")
    .upsert(
      local.map((p) => ({ school_year: p.schoolYear, data: p })),
      { onConflict: "user_id,school_year", ignoreDuplicates: true },
    );
  if (error) {
    console.error("migrate profiles failed", error);
    return;
  }
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* bỏ qua */
  }
}
