"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export function LoginForm() {
  const [error, action, pending] = useActionState(loginAction, null);
  const input = "w-full rounded-xl border border-amber-200 bg-white px-4 py-2.5 outline-none focus:border-teal-500";
  return (
    <form action={action} className="mx-auto mt-16 w-full max-w-sm space-y-4 rounded-3xl bg-white p-8 shadow-lg ring-1 ring-amber-100">
      <h1 className="font-display text-2xl font-extrabold">Đăng nhập quản trị</h1>
      <input name="email" type="email" required placeholder="Email" autoComplete="username" className={input} />
      <input name="password" type="password" required placeholder="Mật khẩu" autoComplete="current-password" className={input} />
      {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
      <button disabled={pending} className="w-full rounded-full bg-teal-600 py-2.5 font-bold text-white hover:bg-teal-700 disabled:opacity-60">
        {pending ? "Đang đăng nhập…" : "Đăng nhập"}
      </button>
    </form>
  );
}
