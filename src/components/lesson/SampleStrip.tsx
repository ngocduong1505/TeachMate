"use client";

import { DOMAIN_STYLE } from "./theme";
import { SAMPLES, type FormValues } from "./samples";

export function SampleStrip({ onPick }: { onPick: (v: FormValues) => void }) {
  return (
    <section aria-label="Gợi ý nhanh" className="rounded-3xl border-2 border-amber-100 bg-white/80 p-5 shadow-lg shadow-amber-100/50">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-xl font-bold text-ink">💡 Gợi ý nhanh</h2>
        <p className="text-sm text-stone-500">Chọn một hoạt động để điền sẵn thông tin, cô có thể sửa lại.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {SAMPLES.map((s) => {
          const style = DOMAIN_STYLE[s.values.domain];
          return (
            <button
              key={s.title}
              type="button"
              onClick={() => onPick(s.values)}
              className={`group flex flex-col rounded-2xl border-2 border-transparent p-4 text-left transition hover:-translate-y-1 hover:border-teal-300 hover:shadow-lg ${style.bg}`}
            >
              <span className="flex items-center justify-between text-xs font-bold">
                <span className={`rounded-full px-2.5 py-0.5 ${style.chip}`}>
                  {style.emoji} {s.tag}
                </span>
                <span className="text-stone-500">⏱ {s.minutes}</span>
              </span>
              <span className="mt-3 line-clamp-2 font-display text-base font-bold leading-snug text-ink">{s.title}</span>
              <span className="mt-1 text-xs text-stone-600">Chủ đề: {s.values.theme}</span>
              <span className="mt-3 flex items-center justify-between border-t border-black/5 pt-2 text-xs font-bold text-teal-700">
                {s.className}
                <span className="transition group-hover:translate-x-1">→</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
