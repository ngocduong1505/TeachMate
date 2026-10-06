"use client";

import { useState } from "react";
import type { DomainId } from "@/lib/curriculum";
import { lessonFileName, lessonToBlob } from "@/lib/docx/lesson";
import { lessonToText } from "@/lib/lessonText";
import type { DocMeta, Lesson } from "@/lib/schemas/lesson";
import type { PartialLesson } from "@/hooks/useLessonStream";
import { DocumentPaper } from "./DocumentPaper";
import { DOMAIN_STYLE } from "./theme";

type Props = {
  partial: PartialLesson | null;
  lesson: Lesson | null;
  loading: boolean;
  error: string | null;
  cached: boolean;
  domain: DomainId;
  meta: DocMeta;
  onRegenerate: () => void;
};

const STEPS = [
  { key: "objectives", label: "Mục tiêu", emoji: "🎯" },
  { key: "preparation", label: "Chuẩn bị", emoji: "🧺" },
  { key: "procedure", label: "Tiến hành", emoji: "🎪" },
  { key: "extension", label: "Mở rộng", emoji: "🌱" },
] as const;

export function LessonView({ partial, lesson, loading, error, cached, domain, meta, onRegenerate }: Props) {
  const [view, setView] = useState<"doc" | "cards">("doc");
  if (error) return <ErrorCard message={error} />;
  if (!partial) return loading ? <Thinking /> : <EmptyState />;

  const style = DOMAIN_STYLE[domain];
  const reached = STEPS.filter((s) => partial[s.key]).length;

  return (
    <article className="animate-rise overflow-hidden rounded-3xl border-2 border-amber-100 bg-white shadow-xl shadow-amber-100/60 print:border-0 print:shadow-none">
      <header className={`bg-gradient-to-r ${style.header} px-6 py-6 text-white`}>
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <span className="rounded-full bg-white/25 px-3 py-1">
            {style.emoji} {partial.domain ?? "..."}
          </span>
          {partial.ageGroup && <span className="rounded-full bg-white/25 px-3 py-1">{partial.ageGroup}</span>}
          {partial.duration && <span className="rounded-full bg-white/25 px-3 py-1">⏱ {partial.duration}</span>}
        </div>
        <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight">
          {partial.title ?? <span className="inline-block h-8 w-2/3 animate-pulse rounded-lg bg-white/30" />}
        </h2>
        {partial.theme && <p className="mt-1 text-sm font-semibold text-white/90">Chủ đề: {partial.theme}</p>}
      </header>

      {loading ? (
        <ProgressBar reached={reached} />
      ) : (
        lesson && (
          <Toolbar lesson={lesson} meta={meta} cached={cached} onRegenerate={onRegenerate} />
        )
      )}

      <div className="no-print flex items-center gap-2 border-b border-amber-100 px-6 py-3">
        <span className="text-sm font-bold text-stone-500">Cách xem:</span>
        {(
          [
            ["doc", "📄 Văn bản chuẩn"],
            ["cards", "🗂 Dạng thẻ"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setView(id)}
            aria-pressed={view === id}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
              view === id ? "bg-teal-600 text-white" : "bg-amber-50 text-amber-800 hover:bg-amber-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {view === "doc" && <DocumentPaper partial={partial} meta={meta} />}

      <div className={`space-y-4 p-6 ${view === "doc" ? "hidden" : ""}`}>
        {partial.objectives && (
          <Section emoji="🎯" title="I. Mục đích yêu cầu" tint="bg-emerald-50">
            <Group title="Kiến thức" items={partial.objectives.knowledge} dot="bg-emerald-400" />
            <Group title="Kỹ năng" items={partial.objectives.skills} dot="bg-sky-400" />
            <Group title="Thái độ" items={partial.objectives.attitude} dot="bg-rose-400" />
          </Section>
        )}

        {partial.preparation && (
          <Section emoji="🧺" title="II. Chuẩn bị" tint="bg-amber-50">
            <Group title="Của cô" items={partial.preparation.teacher} dot="bg-amber-400" />
            <Group title="Của trẻ" items={partial.preparation.children} dot="bg-orange-400" />
          </Section>
        )}

        {!!partial.procedure?.length && (
          <Section emoji="🎪" title="III. Tiến hành" tint="bg-sky-50">
            <ol className="relative space-y-4 border-l-2 border-dashed border-sky-200 pl-6">
              {partial.procedure.map((p, i) => (
                <li key={i} className="relative animate-rise">
                  <span className="absolute -left-[37px] grid size-7 place-items-center rounded-full bg-sky-500 text-sm font-extrabold text-white ring-4 ring-sky-50">
                    {i + 1}
                  </span>
                  <h4 className="font-display text-lg font-bold text-ink">
                    {p.step}
                    {p.time && <span className="ml-2 rounded-full bg-sky-100 px-2.5 py-0.5 align-middle text-xs font-bold text-sky-700">⏱ {p.time}</span>}
                  </h4>
                  <div className="mt-2 grid gap-3 md:grid-cols-2">
                    {p.teacherActions && (
                      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-sky-100">
                        <p className="mb-1 text-xs font-extrabold uppercase tracking-wide text-sky-600">👩‍🏫 Hoạt động của cô</p>
                        <p className="whitespace-pre-line text-[15px] leading-relaxed text-stone-700">{p.teacherActions}</p>
                      </div>
                    )}
                    {p.childrenActions && (
                      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-pink-100">
                        <p className="mb-1 text-xs font-extrabold uppercase tracking-wide text-pink-600">🧒 Hoạt động của trẻ</p>
                        <p className="whitespace-pre-line text-[15px] leading-relaxed text-stone-700">{p.childrenActions}</p>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {partial.extension && (
          <Section emoji="🌱" title="IV. Mở rộng" tint="bg-violet-50">
            <p className="whitespace-pre-line leading-relaxed text-stone-700">{partial.extension}</p>
          </Section>
        )}
      </div>
    </article>
  );
}

function Section({
  emoji,
  title,
  tint,
  children,
}: {
  emoji: string;
  title: string;
  tint: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`animate-rise rounded-2xl ${tint} p-5`}>
      <h3 className="mb-3 flex items-center gap-2 font-display text-xl font-bold text-ink">
        <span className="grid size-9 place-items-center rounded-xl bg-white text-xl shadow-sm">{emoji}</span>
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Group({ title, items, dot }: { title: string; items?: (string | undefined)[]; dot: string }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="mb-1.5 text-sm font-extrabold text-stone-600">{title}</p>
      <ul className="space-y-1.5">
        {items.map((t, i) => (
          <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed text-stone-700">
            <span className={`mt-2 size-2 shrink-0 rounded-full ${dot}`} />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProgressBar({ reached }: { reached: number }) {
  return (
    <div className="no-print flex flex-wrap items-center gap-2 border-b border-amber-100 bg-amber-50/60 px-6 py-3">
      <span className="mr-1 text-sm font-bold text-stone-600">Đang viết</span>
      {STEPS.map((s, i) => {
        const done = i < reached - 1;
        const active = i === reached - 1;
        return (
          <span
            key={s.key}
            className={`rounded-full px-3 py-1 text-xs font-bold transition ${
              done
                ? "bg-teal-600 text-white"
                : active
                  ? "animate-pulse bg-amber-300 text-amber-900"
                  : "bg-white text-stone-400 ring-1 ring-amber-100"
            }`}
          >
            {done ? "✓" : s.emoji} {s.label}
          </span>
        );
      })}
    </div>
  );
}

function Toolbar({
  lesson,
  meta,
  cached,
  onRegenerate,
}: {
  lesson: Lesson;
  meta: DocMeta;
  cached: boolean;
  onRegenerate: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  async function exportWord() {
    setExporting(true);
    try {
      const blob = await lessonToBlob(lesson, meta);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = lessonFileName(lesson);
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(lessonToText(lesson));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* trình duyệt chặn clipboard: bỏ qua */
    }
  }

  const btn =
    "rounded-full px-4 py-2 text-sm font-bold transition hover:-translate-y-0.5 disabled:opacity-60";
  return (
    <div className="no-print border-b border-amber-100 bg-amber-50/60 px-6 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={exportWord} disabled={exporting} className={`${btn} bg-teal-600 text-white shadow-md shadow-teal-200 hover:bg-teal-700`}>
          {exporting ? "Đang xuất..." : "📄 Tải file Word"}
        </button>
        <button onClick={copy} className={`${btn} bg-white text-stone-700 ring-1 ring-amber-200 hover:bg-amber-50`}>
          {copied ? "✓ Đã sao chép" : "📋 Sao chép"}
        </button>
        <button onClick={() => window.print()} className={`${btn} bg-white text-stone-700 ring-1 ring-amber-200 hover:bg-amber-50`}>
          🖨 In
        </button>
        {cached && (
          <button onClick={onRegenerate} className={`${btn} ml-auto bg-white text-orange-700 ring-1 ring-orange-200 hover:bg-orange-50`}>
            🔄 Tạo bản khác
          </button>
        )}
      </div>
      {cached && (
        <p className="mt-2 text-xs text-stone-500">
          Đây là giáo án đã tạo trước đó cho cùng yêu cầu. Bấm &quot;Tạo bản khác&quot; nếu cô muốn bản mới.
        </p>
      )}
    </div>
  );
}

function Thinking() {
  return (
    <div className="animate-pop rounded-3xl border-2 border-amber-100 bg-white p-8 shadow-xl shadow-amber-100/60">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex gap-1.5">
          {[0, 150, 300].map((d) => (
            <span key={d} className="size-3 animate-bounce rounded-full bg-amber-400" style={{ animationDelay: `${d}ms` }} />
          ))}
        </span>
        <p className="font-display text-xl font-bold text-ink">Cô giáo AI đang suy nghĩ...</p>
      </div>
      <div className="space-y-3">
        <div className="skeleton h-8 w-2/3 rounded-xl" />
        <div className="skeleton h-4 w-full rounded-lg" />
        <div className="skeleton h-4 w-11/12 rounded-lg" />
        <div className="skeleton h-4 w-4/5 rounded-lg" />
        <div className="skeleton mt-6 h-24 w-full rounded-2xl" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="grid min-h-[420px] place-items-center rounded-3xl border-2 border-dashed border-amber-200 bg-white/60 p-8 text-center">
      <div className="max-w-sm">
        <div className="relative mx-auto mb-4 size-28">
          <span className="absolute inset-0 grid animate-float place-items-center text-7xl">📝</span>
          <span className="absolute -right-3 top-0 animate-float-slow text-3xl [--r:12deg]">🌈</span>
          <span className="absolute -left-4 bottom-2 animate-float-slow text-3xl [--r:-10deg]">🧸</span>
        </div>
        <h3 className="font-display text-2xl font-bold text-ink">Giáo án của cô sẽ hiện ở đây</h3>
        <p className="mt-2 text-stone-600">
          Chọn lớp, lĩnh vực, nhập chủ đề rồi bấm <b>Soạn giáo án ngay</b>. Chỉ mất chừng nửa phút thôi ạ!
        </p>
      </div>
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div role="alert" className="animate-pop rounded-3xl border-2 border-rose-200 bg-rose-50 p-8 text-center">
      <div className="text-5xl">😿</div>
      <h3 className="mt-3 font-display text-2xl font-bold text-rose-800">Chưa soạn được rồi</h3>
      <p className="mt-2 text-rose-700">{message}</p>
    </div>
  );
}
