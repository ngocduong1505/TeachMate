import type { Metadata } from "next";
import Link from "next/link";
import { adminConfigured, fetchAdmins, fetchLogs, getAdmin, type LogRow } from "@/lib/admin";
import { addAdminAction, logoutAction, removeAdminAction } from "./actions";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Quản trị – TeachMate", robots: { index: false } };
export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = { lesson: "Tiết học", corner: "Góc chơi", outdoor: "Ngoài trời", weekly: "Kế hoạch tuần" };
const STATUS_LABEL: Record<string, string> = { success: "Thành công", cached: "Từ cache", rate_limited: "Bị giới hạn", error: "Lỗi" };
const STATUS_STYLE: Record<string, string> = {
  success: "bg-emerald-100 text-emerald-700",
  cached: "bg-sky-100 text-sky-700",
  rate_limited: "bg-amber-100 text-amber-700",
  error: "bg-rose-100 text-rose-700",
};
const fmt = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "medium", timeZone: "Asia/Ho_Chi_Minh" });
const dayKey = (d: string | Date) => new Date(d).toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });

function count<T>(rows: T[], by: (r: T) => string | null | undefined) {
  const m = new Map<string, number>();
  for (const r of rows) {
    const k = by(r);
    if (k) m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m].sort((a, b) => b[1] - a[1]);
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string; status?: string }> }) {
  const { tab, status } = await searchParams;
  const shell = (children: React.ReactNode) => <main className="mx-auto max-w-7xl px-5 py-8">{children}</main>;

  if (!adminConfigured()) return shell(<p>Chưa cấu hình Supabase (NEXT_PUBLIC_SUPABASE_URL / PUBLISHABLE_KEY).</p>);
  const admin = await getAdmin();
  if (!admin) return shell(<LoginForm />);

  const [logs, admins] = await Promise.all([fetchLogs(admin.token), fetchAdmins(admin.token)]);
  const today = dayKey(new Date());
  const attempts = logs.filter((l) => l.status !== "rate_limited");
  const ok = attempts.filter((l) => l.status === "success" || l.status === "cached").length;
  const timed = logs.filter((l) => l.status === "success" && l.duration_ms);
  const avg = timed.length ? timed.reduce((s, l) => s + (l.duration_ms ?? 0), 0) / timed.length / 1000 : 0;
  const users = new Set(logs.map((l) => l.client_hash).filter(Boolean)).size;

  const dayCount = new Map(count(logs, (l) => dayKey(l.created_at)));
  const days = Array.from({ length: 14 }, (_, i) => dayKey(new Date(Date.now() - (13 - i) * 86_400_000)));
  const max = Math.max(1, ...days.map((d) => dayCount.get(d) ?? 0));

  const cachedPct = logs.length ? Math.round((logs.filter((l) => l.status === "cached").length / logs.length) * 100) : 0;
  const stats: [string, string | number][] = [
    ["Hôm nay", dayCount.get(today) ?? 0],
    ["30 ngày qua", logs.length],
    ["Tỉ lệ thành công", attempts.length ? `${Math.round((ok / attempts.length) * 100)}%` : "–"],
    ["Từ cache", `${cachedPct}%`],
    ["Thời gian TB", avg ? `${avg.toFixed(1)}s` : "–"],
    ["Người dùng (IP)", users],
  ];
  const shown: LogRow[] = (status ? logs.filter((l) => l.status === status) : logs).slice(0, 100);
  const tabCls = (on: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-bold ${on ? "bg-teal-600 text-white" : "bg-white text-stone-600 ring-1 ring-amber-200"}`;

  return shell(
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-extrabold">Quản trị</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin" className={tabCls(tab !== "admins")}>Nhật ký sử dụng</Link>
          <Link href="/admin?tab=admins" className={tabCls(tab === "admins")}>Quản trị viên</Link>
          <form action={logoutAction}>
            <button className="rounded-full px-3 py-1.5 text-sm text-stone-500 hover:text-rose-600">{admin.email} · Đăng xuất</button>
          </form>
        </div>
      </div>

      {tab === "admins" ? (
        <section className="max-w-xl space-y-4">
          <form action={addAdminAction} className="flex gap-2">
            <input name="email" type="email" required placeholder="Email người dùng Supabase Auth" className="flex-1 rounded-xl border border-amber-200 bg-white px-4 py-2 outline-none focus:border-teal-500" />
            <button className="rounded-full bg-teal-600 px-5 font-bold text-white hover:bg-teal-700">Thêm</button>
          </form>
          <p className="text-sm text-stone-500">Người dùng cần có tài khoản trong Supabase Authentication trước.</p>
          <ul className="divide-y divide-amber-100 rounded-2xl bg-white ring-1 ring-amber-100">
            {admins.map((a) => (
              <li key={a.email} className="flex items-center justify-between px-4 py-3">
                <span>{a.email}</span>
                {a.email.toLowerCase() === admin.email.toLowerCase() ? (
                  <span className="text-xs text-stone-400">Bạn</span>
                ) : (
                  <form action={removeAdminAction}>
                    <input type="hidden" name="email" value={a.email} />
                    <button className="text-sm font-semibold text-rose-600 hover:underline">Xóa</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-3 md:grid-cols-6">
            {stats.map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-amber-100">
                <div className="text-xs font-semibold text-stone-500">{label}</div>
                <div className="mt-1 font-display text-3xl font-extrabold text-teal-700">{value}</div>
              </div>
            ))}
          </section>

          <section className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-amber-100 lg:col-span-2">
              <h2 className="mb-3 font-bold">Lượt dùng 14 ngày gần nhất</h2>
              <div className="flex h-40 items-end gap-1.5">
                {days.map((d) => {
                  const n = dayCount.get(d) ?? 0;
                  return (
                    <div key={d} className="flex h-full flex-1 flex-col items-center justify-end gap-1" title={`${d}: ${n}`}>
                      <span className="text-[10px] text-stone-500">{n || ""}</span>
                      <div className="w-full rounded-t bg-teal-500" style={{ height: `${(n / max) * 75}%`, minHeight: n ? 3 : 0 }} />
                      <span className="text-[10px] text-stone-400">{d.slice(8)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-amber-100">
              <Breakdown title="Loại kế hoạch" rows={count(logs, (l) => l.plan_type)} label={TYPE_LABEL} />
              <Breakdown title="Nhóm tuổi" rows={count(logs, (l) => l.age_group)} />
            </div>
          </section>

          <section className="mt-6 rounded-2xl bg-white p-5 ring-1 ring-amber-100">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <h2 className="mr-2 font-bold">Nhật ký gần đây</h2>
              <Link href="/admin" className={tabCls(!status)}>Tất cả</Link>
              {Object.entries(STATUS_LABEL).map(([k, v]) => (
                <Link key={k} href={`/admin?status=${k}`} className={tabCls(status === k)}>{v}</Link>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-stone-500">
                  <tr>
                    {["Thời gian", "Loại", "Nhóm tuổi", "Chủ đề / hoạt động", "Thao tác", "Trạng thái", "Xử lý"].map((h) => (
                      <th key={h} className="px-2 py-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-50">
                  {shown.map((l) => (
                    <tr key={l.id}>
                      <td className="whitespace-nowrap px-2 py-2 text-stone-500">{fmt.format(new Date(l.created_at))}</td>
                      <td className="px-2 py-2">{TYPE_LABEL[l.plan_type] ?? l.plan_type}</td>
                      <td className="px-2 py-2">{l.age_group}</td>
                      <td className="max-w-xs truncate px-2 py-2" title={`${l.theme ?? ""} / ${l.activity ?? ""}`}>
                        {[l.theme, l.activity].filter(Boolean).join(" · ")}
                      </td>
                      <td className="px-2 py-2">{l.action === "revise" ? "Chỉnh sửa" : "Tạo mới"}</td>
                      <td className="px-2 py-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_STYLE[l.status] ?? ""}`}>
                          {STATUS_LABEL[l.status] ?? l.status}
                        </span>
                        {l.error && <span className="ml-1 text-xs text-stone-400">{l.error}</span>}
                      </td>
                      <td className="px-2 py-2">{l.duration_ms ? `${(l.duration_ms / 1000).toFixed(1)}s` : "–"}</td>
                    </tr>
                  ))}
                  {!shown.length && (
                    <tr><td colSpan={7} className="px-2 py-8 text-center text-stone-400">Chưa có dữ liệu</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </>,
  );
}

function Breakdown({ title, rows, label = {} }: { title: string; rows: [string, number][]; label?: Record<string, string> }) {
  const total = rows.reduce((s, [, n]) => s + n, 0) || 1;
  return (
    <div>
      <h2 className="mb-2 font-bold">{title}</h2>
      <ul className="space-y-1.5 text-sm">
        {rows.slice(0, 6).map(([k, n]) => (
          <li key={k}>
            <div className="flex justify-between"><span>{label[k] ?? k}</span><span className="text-stone-500">{n}</span></div>
            <div className="h-1.5 rounded bg-amber-100">
              <div className="h-full rounded bg-teal-500" style={{ width: `${(n / total) * 100}%` }} />
            </div>
          </li>
        ))}
        {!rows.length && <li className="text-stone-400">Chưa có dữ liệu</li>}
      </ul>
    </div>
  );
}
