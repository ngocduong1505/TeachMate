import { Redis } from "@upstash/redis";

/** Upstash Redis (free tier). Không cấu hình thì trả về null và các lớp trên dùng bộ nhớ tạm (chỉ phù hợp khi dev). */
export const redis: Redis | null =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;
