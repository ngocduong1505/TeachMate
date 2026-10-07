"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AGE_GROUPS, PLAN_TYPE_INFO } from "@/lib/curriculum";
import { removePlan, updatePlan } from "@/lib/library";
import { TYPE_STYLE } from "@/components/lesson/theme";
import { useAuth } from "@/components/AuthProvider";
import { useLibrary } from "@/hooks/useLibrary";
import type { PlanType } from "@/lib/schemas/lesson";

const dateFmt = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" });

export default function LibraryPage() {
  const { items, ready, error, user } = useLibrary();
  const { configured } = useAuth();
  const [q, setQ] = useState("");
  const [type, setType] = useState<PlanType | "all">("all");
  const [onlyFav, setOnlyFav] = useState(false);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items
      .filter((i) => (type === "all" || i.type === type) && (!onlyFav || i.favorite))
      .filter((i) => !needle || [i.title, i.form.theme, i.form.branch, i.form.activity].join(" ").toLowerCase().includes(needle))
      .sort((a, b) => Number(b.favorite) - Number(a.favorite) || b.updatedAt - a.updatedAt);
  }, [items, q, type, onlyFav]);

  const chip = (on: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-bold transition ${on ? "bg-teal-600 text-white" : "bg-white text-stone-600 ring-1 ring-amber-200 hover:bg-amber-50"}`;

  return (
    <main className="bg-dots">
      <div className="mx-auto max-w-7xl space-y-6 px-5 py-10 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-4xl font-extrabold text-ink">Thư viện của cô 📚</h1>
            <p className="mt-1 text-stone-600">
              {user
                ? "Giáo án được tự động lưu trong tài khoản của cô, dùng được trên mọi thiết bị."
                : "Giáo án được tự động lưu trên trình duyệt này. Xóa dữ liệu trình duyệt sẽ mất các bản đã lưu."}
            </p>
          </div>
          <Link href="/lesson/new" className="rounded-full bg-teal-600 px-5 py-2 text-sm font-bold text-white shadow-md shadow-teal-200 hover:bg-teal-700">
            ✨ Soạn mới
          </Link>
        </div>

        {configured && !user && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
            <p className="text-sm text-amber-900">
              ☁️ Đăng nhập để giáo án và hồ sơ lớp được lưu an toàn, mở được trên điện thoại và máy khác. Các bản hiện có sẽ được chuyển vào tài khoản.
            </p>
            <Link href="/login" className="rounded-full bg-teal-600 px-4 py-1.5 text-sm font-bold text-white hover:bg-teal-700">
              Đăng nhập / Đăng ký
            </Link>
          </div>
        )}

        {error && <p className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">Không tải được thư viện, vui lòng thử lại sau.</p>}

        <div className="flex flex-wrap items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo tên, chủ đề, hoạt động…"
            className="min-w-64 flex-1 rounded-full border border-amber-200 bg-white px-4 py-2 outline-none focus:border-teal-500"
          />
          <button onClick={() => setType("all")} className={chip(type === "all")}>Tất cả</button>
          {PLAN_TYPE_INFO.map((t) => (
            <button key={t.id} onClick={() => setType(t.id)} className={chip(type === t.id)}>
              {TYPE_STYLE[t.id].emoji} {t.label}
            </button>
          ))}
          <button onClick={() => setOnlyFav((v) => !v)} className={chip(onlyFav)}>⭐ Đã gắn sao</button>
        </div>

        {!ready || error ? null : !items.length ? (
          <div className="rounded-3xl bg-white p-12 text-center ring-1 ring-amber-100">
            <p className="text-5xl">🗂️</p>
            <p className="mt-3 font-bold">Chưa có giáo án nào được lưu</p>
            <p className="text-sm text-stone-500">Soạn một giáo án, bản nháp sẽ tự động xuất hiện ở đây.</p>
          </div>
        ) : !shown.length ? (
          <p className="py-10 text-center text-stone-500">Không tìm thấy giáo án phù hợp.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((i) => {
              const style = TYPE_STYLE[i.type];
              const age = AGE_GROUPS.find((a) => a.id === i.form.ageGroup)?.label ?? i.plan.ageGroup;
              return (
                <li key={i.id} className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-amber-100">
                  <div className={`flex items-center justify-between bg-gradient-to-r ${style.header} px-4 py-2 text-xs font-bold text-white`}>
                    <span>
                      {style.emoji} {PLAN_TYPE_INFO.find((t) => t.id === i.type)?.label}
                    </span>
                    <button
                      onClick={() => void updatePlan(i.id, { favorite: !i.favorite })}
                      title={i.favorite ? "Bỏ sao" : "Gắn sao"}
                      className="text-base leading-none"
                    >
                      {i.favorite ? "⭐" : "☆"}
                    </button>
                  </div>
                  <div className="flex-1 space-y-1 p-4">
                    <h2 className="font-display text-lg font-bold leading-snug">{i.title}</h2>
                    <p className="text-sm text-stone-600">
                      Chủ đề: {i.form.theme}
                      {i.form.branch ? ` › ${i.form.branch}` : ""}
                    </p>
                    <p className="text-xs text-stone-500">
                      {age} · {dateFmt.format(i.updatedAt)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-amber-50 px-4 py-2.5">
                    <Link href={`/lesson/new?open=${i.id}`} className="text-sm font-bold text-teal-700 hover:underline">
                      Mở
                    </Link>
                    <button
                      onClick={() => confirm(`Xóa "${i.title}"?`) && void removePlan(i.id)}
                      className="text-sm font-semibold text-rose-600 hover:underline"
                    >
                      Xóa
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
