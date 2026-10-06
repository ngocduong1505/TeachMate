"use client";

import { useState } from "react";
import { planTypeById, type DomainId } from "@/lib/curriculum";
import { planFileName, planToBlob } from "@/lib/docx/lesson";
import { planToText } from "@/lib/lessonText";
import type { DeepPartial, DocMeta, Lesson, Plan, PlanType } from "@/lib/schemas/lesson";
import type { PartialPlan } from "@/hooks/useLessonStream";
import { CardsView } from "./CardsView";
import { DocumentPaper } from "./DocumentPaper";
import { DOMAIN_STYLE, STEPS_BY_TYPE, TYPE_STYLE } from "./theme";

type Props = {
  partial: PartialPlan | null;
  plan: Plan | null;
  planType: PlanType;
  loading: boolean;
  error: string | null;
  cached: boolean;
  domain: DomainId;
  meta: DocMeta;
  onRegenerate: () => void;
};

export function LessonView({ partial, plan, planType, loading, error, cached, domain, meta, onRegenerate }: Props) {
  const [view, setView] = useState<"doc" | "cards">("doc");
  if (error) return <ErrorCard message={error} />;
  if (!partial) return loading ? <Thinking /> : <EmptyState />;

  const p = partial as DeepPartial<Lesson> & { branch?: string };
  const typeInfo = planTypeById(planType);
  const typeStyle = TYPE_STYLE[planType];
  const domainStyle = DOMAIN_STYLE[domain];
  const useDomainColor = planType === "lesson" || planType === "outdoor";
  const steps = STEPS_BY_TYPE[planType];
  const reached = steps.filter((s) => (partial as Record<string, unknown>)[s.key]).length;
  const canCards = planType === "lesson";

  return (
    <article className="animate-rise overflow-hidden rounded-3xl border-2 border-amber-100 bg-white shadow-xl shadow-amber-100/60 print:border-0 print:shadow-none">
      <header
        className={`bg-gradient-to-r ${useDomainColor ? domainStyle.header : typeStyle.header} px-6 py-6 text-white xl:px-10`}
      >
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <span className="rounded-full bg-white/25 px-3 py-1">
            {typeStyle.emoji} {typeInfo?.label}
          </span>
          {useDomainColor && p.domain && (
            <span className="rounded-full bg-white/25 px-3 py-1">
              {domainStyle.emoji} {p.domain}
            </span>
          )}
          {p.ageGroup && <span className="rounded-full bg-white/25 px-3 py-1">{p.ageGroup}</span>}
          {p.duration && planType !== "weekly" && <span className="rounded-full bg-white/25 px-3 py-1">⏱ {p.duration}</span>}
        </div>
        <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight">
          {p.title ?? <span className="inline-block h-8 w-2/3 animate-pulse rounded-lg bg-white/30" />}
        </h2>
        {p.theme && (
          <p className="mt-1 text-sm font-semibold text-white/90">
            Chủ đề: {p.theme}
            {p.branch ? ` › ${p.branch}` : ""}
          </p>
        )}
      </header>

      {loading ? (
        <ProgressBar steps={steps} reached={reached} />
      ) : (
        plan && <Toolbar planType={planType} plan={plan} meta={meta} cached={cached} onRegenerate={onRegenerate} />
      )}

      {canCards && (
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
      )}

      {canCards && view === "cards" ? (
        <CardsView partial={p} />
      ) : (
        <DocumentPaper type={planType} partial={partial} meta={meta} />
      )}
    </article>
  );
}

function ProgressBar({ steps, reached }: { steps: { key: string; label: string; emoji: string }[]; reached: number }) {
  return (
    <div className="no-print flex flex-wrap items-center gap-2 border-b border-amber-100 bg-amber-50/60 px-6 py-3">
      <span className="mr-1 text-sm font-bold text-stone-600">Đang viết</span>
      {steps.map((s, i) => {
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
  planType,
  plan,
  meta,
  cached,
  onRegenerate,
}: {
  planType: PlanType;
  plan: Plan;
  meta: DocMeta;
  cached: boolean;
  onRegenerate: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  async function exportWord() {
    setExporting(true);
    try {
      const blob = await planToBlob(planType, plan, meta);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = planFileName(planType, plan);
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(planToText(planType, plan));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* trình duyệt chặn clipboard: bỏ qua */
    }
  }

  const btn = "rounded-full px-4 py-2 text-sm font-bold transition hover:-translate-y-0.5 disabled:opacity-60";
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
          Đây là bản đã tạo trước đó cho cùng yêu cầu. Bấm &quot;Tạo bản khác&quot; nếu cô muốn bản mới.
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
        <h3 className="font-display text-2xl font-bold text-ink">Kết quả sẽ hiện ở đây</h3>
        <p className="mt-2 text-stone-600">
          Điền thông tin rồi bấm <b>Soạn ngay</b>. Chỉ mất chừng nửa phút thôi ạ!
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
