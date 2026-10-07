import type { FormValues } from "@/components/lesson/samples";
import type { LessonRequest, Plan, PlanType } from "@/lib/schemas/lesson";
import { currentUserId, getSupabase } from "@/lib/supabase";

export type SavedPlan = {
  id: string;
  createdAt: number;
  updatedAt: number;
  favorite: boolean;
  type: PlanType;
  title: string;
  form: FormValues; // thông tin đã nhập, để mở lại đúng trạng thái
  request: LessonRequest;
  plan: Plan;
};
export type NewPlan = Omit<SavedPlan, "id" | "createdAt" | "updatedAt" | "favorite">;
type Patch = Partial<Pick<SavedPlan, "plan" | "title" | "favorite">>;

/**
 * Thư viện giáo án. Khách: lưu trong trình duyệt (localStorage).
 * Đã đăng nhập: lưu trên Supabase (bảng `plans`, mỗi người chỉ thấy bản của mình nhờ RLS).
 */
const KEY = "teachmate.library";
const MAX_ITEMS = 100;
const notify = () => window.dispatchEvent(new Event("teachmate:library"));
const sorted = (list: SavedPlan[]) => [...list].sort((a, b) => b.updatedAt - a.updatedAt);

// ---------- Bộ nhớ trình duyệt (khách) ----------

export function readLocal(): SavedPlan[] {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/** Khi đầy bộ nhớ thì bỏ bớt bản cũ nhất không đánh dấu sao. */
function writeLocal(list: SavedPlan[]) {
  let items = list.slice(0, MAX_ITEMS);
  for (;;) {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
      return;
    } catch {
      const drop = [...items].reverse().findIndex((i) => !i.favorite);
      if (drop < 0 || items.length <= 1) return;
      items = items.filter((_, i) => i !== items.length - 1 - drop);
    }
  }
}

// ---------- Supabase (đã đăng nhập) ----------

type Row = {
  id: string;
  type: PlanType;
  title: string;
  form: FormValues;
  request: LessonRequest;
  plan: Plan;
  favorite: boolean;
  created_at: string;
  updated_at: string;
};
const fromRow = (r: Row): SavedPlan => ({
  id: r.id,
  type: r.type,
  title: r.title,
  form: r.form,
  request: r.request,
  plan: r.plan,
  favorite: r.favorite,
  createdAt: Date.parse(r.created_at),
  updatedAt: Date.parse(r.updated_at),
});
const toRow = (p: SavedPlan) => ({
  id: p.id,
  type: p.type,
  title: p.title,
  form: p.form,
  request: p.request,
  plan: p.plan,
  favorite: p.favorite,
  created_at: new Date(p.createdAt).toISOString(),
  updated_at: new Date(p.updatedAt).toISOString(),
});

// ---------- API chung ----------

export async function listPlans(): Promise<SavedPlan[]> {
  if (await currentUserId()) {
    const { data, error } = await (await getSupabase()).from("plans").select("*").order("updated_at", { ascending: false }).limit(300);
    if (error) throw error;
    return (data as Row[]).map(fromRow);
  }
  return sorted(readLocal());
}

export async function getPlan(id: string): Promise<SavedPlan | null> {
  if (await currentUserId()) {
    const { data } = await (await getSupabase()).from("plans").select("*").eq("id", id).maybeSingle();
    return data ? fromRow(data as Row) : null;
  }
  return readLocal().find((i) => i.id === id) ?? null;
}

export async function savePlan(entry: NewPlan): Promise<string> {
  const now = Date.now();
  const item: SavedPlan = { ...entry, id: crypto.randomUUID(), createdAt: now, updatedAt: now, favorite: false };
  if (await currentUserId()) {
    const { error } = await (await getSupabase()).from("plans").insert(toRow(item));
    if (error) throw error;
  } else {
    writeLocal(sorted([item, ...readLocal()]));
  }
  notify();
  return item.id;
}

export async function updatePlan(id: string, patch: Patch): Promise<boolean> {
  let found: boolean;
  if (await currentUserId()) {
    const { data, error } = await (await getSupabase())
      .from("plans")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id");
    if (error) throw error;
    found = (data?.length ?? 0) > 0;
  } else {
    const list = readLocal();
    found = list.some((i) => i.id === id);
    if (found) writeLocal(sorted(list.map((i) => (i.id === id ? { ...i, ...patch, updatedAt: Date.now() } : i))));
  }
  if (found) notify();
  return found;
}

export async function removePlan(id: string) {
  if (await currentUserId()) {
    const { error } = await (await getSupabase()).from("plans").delete().eq("id", id);
    if (error) throw error;
  } else {
    writeLocal(readLocal().filter((i) => i.id !== id));
  }
  notify();
}

/** Sau khi đăng nhập: chuyển các bản đã lưu trên máy (khi còn là khách) lên tài khoản rồi xóa bản cục bộ. */
export async function migrateLocalPlans() {
  const local = readLocal();
  if (!local.length || !(await currentUserId())) return;
  const { error } = await (await getSupabase())
    .from("plans")
    .upsert(local.map(toRow), { onConflict: "id", ignoreDuplicates: true });
  if (error) {
    console.error("migrate plans failed", error);
    return; // giữ nguyên bản cục bộ, thử lại lần đăng nhập sau
  }
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* bỏ qua */
  }
  notify();
}
