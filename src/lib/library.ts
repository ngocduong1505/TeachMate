import type { FormValues } from "@/components/lesson/samples";
import type { LessonRequest, Plan, PlanType } from "@/lib/schemas/lesson";

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

const KEY = "teachmate.library";
const MAX_ITEMS = 100;

export function readLibrary(): SavedPlan[] {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/** Lưu danh sách; khi đầy bộ nhớ thì bỏ bớt bản cũ nhất không đánh dấu sao. */
function writeLibrary(list: SavedPlan[]) {
  let items = list.slice(0, MAX_ITEMS);
  for (;;) {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
      window.dispatchEvent(new Event("teachmate:library"));
      return;
    } catch {
      const drop = [...items].reverse().findIndex((i) => !i.favorite);
      if (drop < 0 || items.length <= 1) return;
      items = items.filter((_, i) => i !== items.length - 1 - drop);
    }
  }
}

const sorted = (list: SavedPlan[]) => [...list].sort((a, b) => b.updatedAt - a.updatedAt);

export function savePlan(entry: Omit<SavedPlan, "id" | "createdAt" | "updatedAt" | "favorite">): string {
  const id = crypto.randomUUID();
  const now = Date.now();
  writeLibrary(sorted([{ ...entry, id, createdAt: now, updatedAt: now, favorite: false }, ...readLibrary()]));
  return id;
}

export function updatePlan(id: string, patch: Partial<Pick<SavedPlan, "plan" | "title" | "favorite">>) {
  const list = readLibrary();
  if (!list.some((i) => i.id === id)) return false;
  writeLibrary(sorted(list.map((i) => (i.id === id ? { ...i, ...patch, updatedAt: Date.now() } : i))));
  return true;
}

export function removePlan(id: string) {
  writeLibrary(readLibrary().filter((i) => i.id !== id));
}

export function getPlan(id: string) {
  return readLibrary().find((i) => i.id === id) ?? null;
}
