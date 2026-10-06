import { createHash } from "node:crypto";
import { redis } from "@/lib/redis";
import { schemaByType, type LessonRequest, type Plan, type PlanType } from "@/lib/schemas/lesson";

const TTL_SECONDS = 60 * 60 * 24 * 7;
const MAX_MEMORY_ENTRIES = 200;
const memory = new Map<string, { plan: Plan; expires: number }>();

const norm = (s?: string) => (s ?? "").normalize("NFC").trim().toLowerCase().replace(/\s+/g, " ");

/** Cùng đầu vào (sau khi chuẩn hóa) thì cùng khóa. `fresh` không nằm trong khóa. */
export function cacheKey(req: LessonRequest) {
  const raw = JSON.stringify([
    req.type,
    req.ageGroup,
    req.domain ?? "",
    norm(req.theme),
    norm(req.branch),
    norm(req.duration),
    norm(req.activity),
    norm(req.notes),
  ]);
  return "plan:v4:" + createHash("sha256").update(raw).digest("hex").slice(0, 32);
}

export async function getCachedPlan(key: string, type: PlanType): Promise<Plan | null> {
  try {
    if (redis) {
      const hit = await redis.get<unknown>(key);
      const parsed = schemaByType[type].safeParse(hit);
      return parsed.success ? (parsed.data as Plan) : null;
    }
    const m = memory.get(key);
    if (!m || m.expires < Date.now()) return null;
    return m.plan;
  } catch (e) {
    console.error("cache get failed", e);
    return null; // cache lỗi không được làm hỏng luồng chính
  }
}

export async function setCachedPlan(key: string, plan: Plan) {
  try {
    if (redis) {
      await redis.set(key, plan, { ex: TTL_SECONDS });
      return;
    }
    if (memory.size >= MAX_MEMORY_ENTRIES) memory.delete(memory.keys().next().value!);
    memory.set(key, { plan, expires: Date.now() + TTL_SECONDS * 1000 });
  } catch (e) {
    console.error("cache set failed", e);
  }
}
