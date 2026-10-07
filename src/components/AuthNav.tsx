"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { displayName } from "@/lib/username";

/** Nút đăng nhập / tên tài khoản trên thanh đầu trang. */
export function AuthNav() {
  const { user, ready, configured, signOut } = useAuth();
  if (!configured || !ready) return null;
  if (!user) {
    return (
      <Link href="/login" className="rounded-full px-4 py-2 text-sm font-bold text-stone-600 ring-1 ring-amber-200 transition hover:bg-amber-100">
        Đăng nhập
      </Link>
    );
  }
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="hidden max-w-40 truncate text-stone-600 sm:inline" title={user.email}>
        👤 {displayName(user.email)}
      </span>
      <button onClick={() => void signOut()} className="rounded-full px-3 py-2 font-semibold text-stone-500 hover:bg-amber-100 hover:text-rose-600">
        Đăng xuất
      </button>
    </div>
  );
}
