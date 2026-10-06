import Link from "next/link";
import { DOMAINS } from "@/lib/curriculum";
import { DOMAIN_STYLE, shortDomainLabel } from "@/components/lesson/theme";

const FEATURES = [
  { emoji: "⚡", title: "Soạn trong nửa phút", text: "Chọn lớp, lĩnh vực, chủ đề, giáo án đầy đủ mục tiêu, chuẩn bị và tiến hành hiện ra ngay." },
  { emoji: "📚", title: "Bám chương trình GDMN", text: "Cấu trúc theo Chương trình giáo dục mầm non, phù hợp từng độ tuổi từ nhà trẻ đến mẫu giáo lớn." },
  { emoji: "📄", title: "Xuất file Word", text: "Tải về .docx đúng định dạng để chỉnh sửa, in và nộp cho nhà trường." },
];

const STEPS = [
  { n: 1, title: "Chọn lớp & lĩnh vực", text: "Nhà trẻ đến 5–6 tuổi, 5 lĩnh vực phát triển." },
  { n: 2, title: "Nhập chủ đề, hoạt động", text: "Chỉ cần một dòng, có thể thêm ghi chú." },
  { n: 3, title: "Nhận giáo án, chỉnh sửa", text: "Xem trực tiếp, tải Word hoặc tạo bản khác." },
];

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-dots relative overflow-hidden">
        <div className="pointer-events-none absolute -left-24 top-10 size-72 rounded-full bg-amber-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-40 size-80 rounded-full bg-teal-200/50 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-bold text-teal-700 shadow-sm ring-1 ring-teal-100">
              🌟 Dành riêng cho giáo viên mầm non
            </span>
            <h1 className="mt-5 font-display text-5xl font-extrabold leading-[1.1] text-ink sm:text-6xl">
              Soạn giáo án <span className="text-teal-600">nhẹ nhàng</span>, dành thêm thời gian cho các bé
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-stone-600">
              TeachMate là trợ lý AI giúp cô soạn giáo án và kế hoạch hoạt động theo độ tuổi, chủ đề, lĩnh vực chỉ trong vài cú nhấp chuột.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/lesson/new"
                className="rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 px-8 py-4 font-display text-xl font-bold text-white shadow-lg shadow-teal-200 transition hover:-translate-y-1 hover:shadow-xl"
              >
                ✨ Soạn giáo án ngay
              </Link>
              <span className="text-sm text-stone-500">Miễn phí · Không cần đăng ký</span>
            </div>
          </div>

          {/* Bản xem trước giáo án */}
          <div className="relative mx-auto w-full max-w-md">
            <span className="absolute -left-6 -top-6 animate-float text-5xl [--r:-10deg]">🌈</span>
            <span className="absolute -right-4 top-1/3 animate-float-slow text-4xl [--r:10deg]">🦋</span>
            <span className="absolute -bottom-6 left-6 animate-float-slow text-4xl [--r:-6deg]">🧸</span>
            <div className="rotate-2 overflow-hidden rounded-3xl border-2 border-amber-100 bg-white shadow-2xl shadow-amber-200/60 transition hover:rotate-0">
              <div className="bg-gradient-to-r from-sky-400 to-cyan-400 px-5 py-4 text-white">
                <div className="flex gap-2 text-xs font-bold">
                  <span className="rounded-full bg-white/25 px-2.5 py-0.5">🔍 Nhận thức</span>
                  <span className="rounded-full bg-white/25 px-2.5 py-0.5">4–5 tuổi</span>
                </div>
                <p className="mt-2 font-display text-xl font-extrabold">Phân biệt con vật nuôi trong gia đình</p>
              </div>
              <div className="space-y-3 p-5 text-sm">
                <div className="rounded-2xl bg-emerald-50 p-3">
                  <p className="font-display font-bold text-ink">🎯 Mục đích yêu cầu</p>
                  <p className="mt-1 text-stone-600">Trẻ gọi tên, nêu đặc điểm nổi bật của 3–4 con vật nuôi quen thuộc.</p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-3">
                  <p className="font-display font-bold text-ink">🧺 Chuẩn bị</p>
                  <p className="mt-1 text-stone-600">Tranh con gà, con chó, con mèo; âm thanh tiếng kêu.</p>
                </div>
                <div className="skeleton h-3 w-4/5 rounded-full" />
                <div className="skeleton h-3 w-3/5 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lĩnh vực */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-14">
        <h2 className="text-center font-display text-3xl font-extrabold text-ink">5 lĩnh vực phát triển</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
          {DOMAINS.map((d) => {
            const s = DOMAIN_STYLE[d.id];
            return (
              <div key={d.id} className={`rounded-3xl ${s.bg} p-5 text-center transition hover:-translate-y-1 hover:shadow-lg`}>
                <div className="text-4xl">{s.emoji}</div>
                <p className="mt-2 font-display text-lg font-bold leading-tight text-ink">
                  {shortDomainLabel(d.label)}
                </p>
                <p className="mt-1 text-xs text-stone-600">{s.blurb}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tính năng */}
      <section className="bg-white/60 py-14">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 sm:px-8 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-3xl border-2 border-amber-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="grid size-14 place-items-center rounded-2xl bg-amber-100 text-3xl">{f.emoji}</div>
              <h3 className="mt-4 font-display text-xl font-bold text-ink">{f.title}</h3>
              <p className="mt-1 leading-relaxed text-stone-600">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cách dùng */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-16">
        <h2 className="text-center font-display text-3xl font-extrabold text-ink">Chỉ 3 bước đơn giản</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="relative rounded-3xl bg-teal-50 p-6 pt-10">
              <span className="absolute -top-5 left-6 grid size-11 place-items-center rounded-full bg-teal-600 font-display text-xl font-extrabold text-white shadow-lg shadow-teal-200">
                {s.n}
              </span>
              <h3 className="font-display text-xl font-bold text-ink">{s.title}</h3>
              <p className="mt-1 text-stone-600">{s.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            href="/lesson/new"
            className="inline-block rounded-full bg-orange-500 px-8 py-4 font-display text-xl font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-1 hover:bg-orange-600"
          >
            Bắt đầu soạn giáo án 🚀
          </Link>
        </div>
      </section>
    </main>
  );
}
