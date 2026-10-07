import { cookies } from "next/headers";

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const COOKIE = "tm_admin";

export type LogRow = {
  id: number;
  created_at: string;
  plan_type: string;
  age_group: string | null;
  domain: string | null;
  theme: string | null;
  activity: string | null;
  action: string;
  status: string;
  error: string | null;
  duration_ms: number | null;
  client_hash: string | null;
};
export type AdminRow = { email: string; created_at: string };

const headers = (token?: string) => ({
  apikey: KEY ?? "",
  Authorization: `Bearer ${token ?? KEY}`,
  "Content-Type": "application/json",
});

export const adminConfigured = () => !!URL_ && !!KEY;

export async function signIn(email: string, password: string) {
  const res = await fetch(`${URL_}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const j = (await res.json()) as { access_token: string; expires_in: number };
  return { token: j.access_token, expiresIn: j.expires_in };
}

export async function setSession(token: string, maxAge: number) {
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge,
  });
}
export async function clearSession() {
  (await cookies()).delete({ name: COOKIE, path: "/admin" });
}

async function rest<T>(token: string, path: string, init?: RequestInit): Promise<T | null> {
  const res = await fetch(`${URL_}/rest/v1/${path}`, {
    ...init,
    headers: { ...headers(token), ...init?.headers },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.status === 204 ? null : ((await res.json()) as T);
}

/** Trả về phiên admin hợp lệ (token + email) hoặc null. */
export async function getAdmin() {
  if (!adminConfigured()) return null;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const user = await fetch(`${URL_}/auth/v1/user`, { headers: headers(token), cache: "no-store" });
  if (!user.ok) return null;
  const { email } = (await user.json()) as { email: string };
  const ok = await rest<boolean>(token, "rpc/is_admin", { method: "POST", body: "{}" });
  return ok === true ? { token, email } : null;
}

export async function fetchLogs(token: string, days = 30) {
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  return (
    (await rest<LogRow[]>(
      token,
      `usage_logs?select=*&created_at=gte.${encodeURIComponent(since)}&order=created_at.desc&limit=2000`,
    )) ?? []
  );
}

export async function fetchAdmins(token: string) {
  return (await rest<AdminRow[]>(token, "admin_users?select=*&order=created_at.asc")) ?? [];
}
export const addAdmin = (token: string, email: string) =>
  rest(token, "admin_users", { method: "POST", body: JSON.stringify({ email }), headers: { Prefer: "return=minimal" } });
export const removeAdmin = (token: string, email: string) =>
  rest(token, `admin_users?email=eq.${encodeURIComponent(email)}`, { method: "DELETE" });
