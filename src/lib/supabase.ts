import type { SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabaseConfigured = !!url && !!key;

let client: Promise<SupabaseClient> | null = null;

/** Supabase client cho trình duyệt (phiên đăng nhập của giáo viên). Nạp động để không chạy phía server. */
export function getSupabase() {
  client ??= import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(url!, key!, { auth: { persistSession: true, autoRefreshToken: true } }),
  );
  return client;
}

/** Id người dùng đang đăng nhập, hoặc null (khách / chưa cấu hình Supabase). */
export async function currentUserId(): Promise<string | null> {
  if (!supabaseConfigured) return null;
  try {
    const { data } = await (await getSupabase()).auth.getSession();
    return data.session?.user.id ?? null;
  } catch {
    return null;
  }
}
