"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getSupabase } from "@/lib/supabase";
import { toLoginEmail } from "@/lib/username";

const MESSAGES: Record<string, string> = {
  "Invalid login credentials": "Email hoặc mật khẩu không đúng.",
  "Email not confirmed": "Email chưa được xác nhận. Cô kiểm tra hộp thư để bấm vào liên kết xác nhận nhé.",
  "User already registered": "Email này đã có tài khoản, cô hãy đăng nhập.",
};

export default function LoginPage() {
  const router = useRouter();
  const { user, ready, configured } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (ready && user) router.replace("/library");
  }, [ready, user, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const login = toLoginEmail(account);
      if (!login) {
        setError("Tên đăng nhập gồm 3–30 ký tự: chữ thường không dấu, số, dấu chấm, gạch dưới hoặc gạch ngang.");
        return;
      }
      const { auth } = await getSupabase();
      if (mode === "login") {
        const { error } = await auth.signInWithPassword({ email: login.email, password });
        if (error) throw error;
      } else {
        const { data, error } = await auth.signUp({ email: login.email, password });
        if (error) throw error;
        // Chưa có phiên nghĩa là Supabase đang bắt buộc xác nhận email
        if (!data.session) {
          setNotice(
            login.isUsername
              ? "Chưa tạo được tài khoản dùng ngay. Cô thử đăng ký bằng email hoặc liên hệ quản trị viên nhé."
              : "Đã gửi email xác nhận. Cô bấm vào liên kết trong email rồi quay lại đăng nhập nhé.",
          );
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setError(MESSAGES[msg] ?? (msg.includes("at least") ? "Mật khẩu cần ít nhất 6 ký tự." : "Không thực hiện được, vui lòng thử lại."));
    } finally {
      setBusy(false);
    }
  }

  const input = "w-full rounded-xl border border-amber-200 bg-white px-4 py-2.5 outline-none focus:border-teal-500";
  const tab = (on: boolean) => `flex-1 rounded-full py-2 text-sm font-bold ${on ? "bg-teal-600 text-white" : "text-stone-600"}`;

  return (
    <main className="bg-dots">
      <div className="mx-auto max-w-md px-5 py-14">
        <div className="space-y-5 rounded-3xl bg-white p-8 shadow-lg ring-1 ring-amber-100">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-ink">{mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}</h1>
            <p className="mt-1 text-sm text-stone-600">
              Đăng nhập để lưu giáo án và hồ sơ lớp trên mọi thiết bị. Không đăng nhập cô vẫn soạn giáo án bình thường.
            </p>
          </div>

          {!configured ? (
            <p className="text-sm text-rose-600">Tính năng tài khoản chưa được cấu hình.</p>
          ) : (
            <>
              <div className="flex gap-1 rounded-full bg-amber-50 p-1">
                <button type="button" onClick={() => setMode("login")} className={tab(mode === "login")}>Đăng nhập</button>
                <button type="button" onClick={() => setMode("signup")} className={tab(mode === "signup")}>Đăng ký</button>
              </div>
              <form onSubmit={submit} className="space-y-3">
                <input
                  required
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  placeholder="Tên đăng nhập hoặc email"
                  autoComplete="username"
                  autoCapitalize="none"
                  className={input}
                />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu (từ 6 ký tự)"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className={input}
                />
                {mode === "signup" && (
                  <p className="text-xs text-stone-500">
                    Cô có thể dùng tên đăng nhập (ví dụ: co.lan.mamnon) không cần email. Lưu ý: tài khoản không có email sẽ không lấy lại được mật khẩu nếu quên.
                  </p>
                )}
                {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
                {notice && <p className="text-sm font-semibold text-emerald-700">{notice}</p>}
                <button disabled={busy} className="w-full rounded-full bg-teal-600 py-2.5 font-bold text-white hover:bg-teal-700 disabled:opacity-60">
                  {busy ? "Đang xử lý…" : mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
                </button>
              </form>
              <p className="text-xs text-stone-500">Các giáo án đã soạn khi chưa đăng nhập trên máy này sẽ được chuyển vào tài khoản.</p>
            </>
          )}
          <Link href="/lesson/new" className="block text-center text-sm font-semibold text-teal-700 hover:underline">
            ← Tiếp tục soạn giáo án không cần đăng nhập
          </Link>
        </div>
      </div>
    </main>
  );
}
