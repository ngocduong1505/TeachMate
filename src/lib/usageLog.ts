import { createHash } from "node:crypto";

export const EVENT_ACTIONS = ["download_word", "copy", "print"] as const;

export type UsageStatus = "success" | "cached" | "rate_limited" | "error";

export type UsageEntry = {
  plan_type: string;
  age_group?: string;
  domain?: string;
  theme?: string;
  activity?: string;
  action: "generate" | "revise" | "download_word" | "copy" | "print";
  status: UsageStatus;
  cached?: boolean;
  error?: string;
  duration_ms?: number;
  client_id?: string;
};

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * Ghi log sử dụng vào bảng `usage_logs` của Supabase qua REST (PostgREST).
 * Không cấu hình thì bỏ qua; lỗi ghi log không bao giờ ảnh hưởng tới người dùng.
 */
export async function logUsage({ client_id, ...entry }: UsageEntry) {
  if (!url || !key) return;
  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/usage_logs`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        ...entry,
        client_hash: client_id ? createHash("sha256").update(client_id).digest("hex").slice(0, 32) : null,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error("usage log failed", res.status, await res.text());
  } catch (e) {
    console.error("usage log failed", e);
  }
}
