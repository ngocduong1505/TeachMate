import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";

export type LimitResult = { ok: true } | { ok: false; retryAfter: number; scope: "user" | "global" };

// Giới hạn theo người dùng (hiện theo IP, sau này đổi sang user id khi có đăng nhập).
const PER_MINUTE = 3;
const PER_DAY = Number(process.env.RATE_LIMIT_PER_DAY ?? 10);
// Trần toàn hệ thống để không vượt quota free của Gemini (RPD).
const GLOBAL_PER_DAY = Number(process.env.GLOBAL_LIMIT_PER_DAY ?? 200);

const upstash = redis && {
  minute: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(PER_MINUTE, "1 m"), prefix: "rl:min" }),
  day: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(PER_DAY, "1 d"), prefix: "rl:day" }),
  global: new Ratelimit({ redis, limiter: Ratelimit.fixedWindow(GLOBAL_PER_DAY, "1 d"), prefix: "rl:global" }),
};

// Dự phòng bộ nhớ tạm cho môi trường dev (không chia sẻ giữa các instance serverless).
const hits = new Map<string, number[]>();
function memoryLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (list.length >= max) {
    hits.set(key, list);
    return Math.ceil((list[0] + windowMs - now) / 1000);
  }
  list.push(now);
  hits.set(key, list);
  return 0;
}

export function clientId(req: Request) {
  const fwd = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return fwd || req.headers.get("x-real-ip") || "unknown";
}

export async function checkRateLimit(id: string): Promise<LimitResult> {
  try {
    if (upstash) {
      const m = await upstash.minute.limit(id);
      if (!m.success) return { ok: false, scope: "user", retryAfter: secondsUntil(m.reset) };
      const d = await upstash.day.limit(id);
      if (!d.success) return { ok: false, scope: "user", retryAfter: secondsUntil(d.reset) };
      const g = await upstash.global.limit("all");
      if (!g.success) return { ok: false, scope: "global", retryAfter: secondsUntil(g.reset) };
      return { ok: true };
    }
    const checks: [string, "user" | "global", number, number][] = [
      [`m:${id}`, "user", PER_MINUTE, 60_000],
      [`d:${id}`, "user", PER_DAY, 86_400_000],
      ["global", "global", GLOBAL_PER_DAY, 86_400_000],
    ];
    for (const [key, scope, max, win] of checks) {
      const retryAfter = memoryLimit(key, max, win);
      if (retryAfter) return { ok: false, scope, retryAfter };
    }
    return { ok: true };
  } catch (e) {
    console.error("ratelimit failed", e);
    return { ok: true }; // Redis lỗi: cho qua thay vì chặn toàn bộ người dùng
  }
}

const secondsUntil = (resetMs: number) => Math.max(1, Math.ceil((resetMs - Date.now()) / 1000));
