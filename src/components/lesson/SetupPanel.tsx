"use client";

import { AGE_GROUPS, DOMAINS, PLAN_TYPE_INFO } from "@/lib/curriculum";
import type { Profile } from "@/hooks/useProfile";
import { DURATIONS, SAMPLES, TYPE_HINTS, type FormValues } from "./samples";
import { AGE_EMOJI, DOMAIN_STYLE, THEME_SUGGESTIONS, TYPE_STYLE, shortDomainLabel } from "./theme";

const input =
  "w-full rounded-2xl border-2 border-amber-100 bg-white px-4 py-3.5 text-base text-ink shadow-sm outline-none transition placeholder:text-stone-400 focus:border-teal-400 focus:ring-4 focus:ring-teal-100";

const chip = (on: boolean) =>
  `rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
    on ? "bg-teal-600 text-white shadow-sm" : "bg-amber-50 text-amber-800 hover:bg-amber-100"
  }`;

function StepTitle({ n, title, hint }: { n: number; title: string; hint?: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-teal-600 font-display text-base font-extrabold text-white">
        {n}
      </span>
      <div>
        <h3 className="font-display text-xl font-bold leading-tight text-ink">{title}</h3>
        {hint && <p className="text-sm text-stone-500">{hint}</p>}
      </div>
    </div>
  );
}

type Props = {
  values: FormValues;
  onChange: (patch: Partial<FormValues>) => void;
  onPickSample: (v: FormValues) => void;
  profile: Profile;
  onProfileChange: (patch: Partial<Profile>) => void;
  loading: boolean;
  onSubmit: () => void;
};

export function SetupPanel({ values: v, onChange, onPickSample, profile, onProfileChange, loading, onSubmit }: Props) {
  const hint = TYPE_HINTS[v.type];
  const age = AGE_GROUPS.find((a) => a.id === v.ageGroup);
  const samples = SAMPLES[v.type];

  return (
    <form
      id="setup"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="animate-rise space-y-10 rounded-[2rem] border-2 border-amber-100 bg-white/85 p-6 shadow-xl shadow-amber-100/60 backdrop-blur sm:p-8 xl:p-10"
    >
      {/* Bước 1 – loại kế hoạch */}
      <section>
        <StepTitle n={1} title="Cô muốn soạn gì hôm nay?" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {PLAN_TYPE_INFO.map((t) => {
            const s = TYPE_STYLE[t.id];
            const on = t.id === v.type;
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={on}
                onClick={() => onChange({ type: t.id })}
                className={`group relative flex items-center gap-4 rounded-3xl border-2 p-5 text-left transition hover:-translate-y-1 hover:shadow-lg ${s.tile} ${
                  on ? `${s.tileOn} ring-4` : "border-transparent"
                }`}
              >
                <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-white text-4xl shadow-sm transition group-hover:rotate-6">
                  {s.emoji}
                </span>
                <span>
                  <span className="block font-display text-xl font-bold leading-tight text-ink">{t.label}</span>
                  <span className="mt-0.5 block text-sm text-stone-600">{t.desc}</span>
                </span>
                {on && (
                  <span className="absolute right-3 top-3 grid size-6 place-items-center rounded-full bg-teal-600 text-xs font-bold text-white">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          <span className="text-sm font-bold text-stone-500">💡 Gợi ý nhanh:</span>
          {samples.map((s) => (
            <button
              key={s.title}
              type="button"
              onClick={() => onPickSample(s.values)}
              title={`${s.className} · ${s.minutes}`}
              className="max-w-full truncate rounded-full border border-amber-200 bg-white px-4 py-1.5 text-sm font-semibold text-stone-700 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:text-teal-700"
            >
              {s.title}
            </button>
          ))}
        </div>
      </section>

      {/* Bước 2 – thông tin chính */}
      <section>
        <StepTitle n={2} title="Thông tin chính" hint="Càng cụ thể, kết quả càng sát với lớp của cô." />
        <div className="grid gap-8 xl:grid-cols-3 xl:gap-10">
          <div>
            <p className="mb-2 text-sm font-bold text-stone-600">Lớp của cô</p>
            <div className="grid grid-cols-2 gap-3">
              {AGE_GROUPS.map((a) => {
                const on = a.id === v.ageGroup;
                return (
                  <button
                    type="button"
                    key={a.id}
                    onClick={() => onChange({ ageGroup: a.id })}
                    aria-pressed={on}
                    className={`rounded-2xl border-2 px-4 py-3.5 text-left transition hover:-translate-y-0.5 ${
                      on ? "border-teal-400 bg-teal-50 ring-4 ring-teal-100" : "border-amber-100 bg-white hover:border-teal-200"
                    }`}
                  >
                    <span className="text-2xl">{AGE_EMOJI[a.id]}</span>
                    <span className="mt-1 block text-base font-bold leading-tight text-ink">{a.label.split(" (")[0]}</span>
                    <span className="text-sm text-stone-500">{a.label.match(/\((.*)\)/)?.[1]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-bold text-stone-600">Lĩnh vực phát triển</p>
            {hint.needsDomain ? (
              <div className="grid gap-2.5">
                {DOMAINS.map((d) => {
                  const s = DOMAIN_STYLE[d.id];
                  const on = d.id === v.domain;
                  return (
                    <button
                      type="button"
                      key={d.id}
                      onClick={() => onChange({ domain: d.id })}
                      aria-pressed={on}
                      className={`flex items-center gap-3 rounded-2xl border-2 p-2.5 pr-4 text-left transition hover:-translate-y-0.5 ${
                        on ? `${s.ring} ${s.bg} ring-4` : "border-amber-100 bg-white hover:border-stone-200"
                      }`}
                    >
                      <span className={`grid size-11 shrink-0 place-items-center rounded-xl text-2xl ${s.bg}`}>{s.emoji}</span>
                      <span className="leading-tight">
                        <span className="block text-base font-bold text-ink">{shortDomainLabel(d.label)}</span>
                        <span className="text-sm text-stone-500">{s.blurb}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-full min-h-40 flex-col justify-center rounded-2xl bg-teal-50 p-5 text-teal-900">
                <p className="text-3xl">🌈</p>
                <p className="mt-2 font-display text-lg font-bold">Tích hợp cả 5 lĩnh vực</p>
                <p className="text-sm">
                  {v.type === "weekly"
                    ? "Kế hoạch tuần tự cân đối thể chất, nhận thức, ngôn ngữ, tình cảm – xã hội và thẩm mỹ."
                    : "Hoạt động góc tự nhiên lồng ghép nhiều lĩnh vực trong cùng một buổi chơi."}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-sm font-bold text-stone-600">Chủ đề &amp; nội dung</p>
            <input
              required
              maxLength={100}
              value={v.theme}
              onChange={(e) => onChange({ theme: e.target.value })}
              className={input}
              placeholder="Chủ đề, ví dụ: Thế giới động vật"
            />
            <div className="flex flex-wrap gap-1.5">
              {THEME_SUGGESTIONS.map((t) => (
                <button type="button" key={t} onClick={() => onChange({ theme: t })} className={chip(v.theme === t)}>
                  {t}
                </button>
              ))}
            </div>
            <input
              required={v.type === "weekly"}
              maxLength={100}
              value={v.branch}
              onChange={(e) => onChange({ branch: e.target.value })}
              className={input}
              placeholder={v.type === "weekly" ? "Chủ đề nhánh / tên tuần (bắt buộc)" : "Chủ đề nhánh / tuần (không bắt buộc)"}
            />
            {hint.needsActivity && (
              <textarea
                required
                rows={3}
                maxLength={150}
                value={v.activity}
                onChange={(e) => onChange({ activity: e.target.value })}
                className={`${input} resize-none`}
                placeholder={`${hint.activityLabel}. ${hint.activityPlaceholder}`}
              />
            )}
          </div>
        </div>
      </section>

      {/* Bước 3 – tùy chọn */}
      <section>
        <StepTitle n={3} title="Tùy chọn thêm" hint="Không bắt buộc, có thể bỏ qua." />
        <div className="grid gap-8 xl:grid-cols-2 xl:gap-10">
          <div className="space-y-3">
            {hint.needsDuration && (
              <div>
                <p className="mb-2 text-sm font-bold text-stone-600">Thời lượng</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button type="button" onClick={() => onChange({ duration: "" })} className={chip(v.duration === "")}>
                    Theo tuổi ({age?.minutes} phút)
                  </button>
                  {DURATIONS.map((d) => (
                    <button type="button" key={d} onClick={() => onChange({ duration: d })} className={chip(v.duration === d)}>
                      {d} phút
                    </button>
                  ))}
                </div>
              </div>
            )}
            <textarea
              rows={3}
              maxLength={500}
              value={v.notes}
              onChange={(e) => onChange({ notes: e.target.value })}
              className={`${input} resize-none`}
              placeholder="Ghi chú thêm: lớp 25 trẻ, có máy chiếu, muốn có trò chơi vận động..."
            />
          </div>

          <div className="rounded-2xl bg-amber-50/70 p-5">
            <p className="text-sm font-bold text-amber-900">🏫 Thông tin trường &amp; giáo viên (in trên file Word)</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input
                value={profile.school}
                onChange={(e) => onProfileChange({ school: e.target.value })}
                className={`${input} sm:col-span-2`}
                placeholder="Tên trường, ví dụ: Trường mầm non Họa Mi"
              />
              <input
                value={profile.className}
                onChange={(e) => onProfileChange({ className: e.target.value })}
                className={input}
                placeholder="Lớp, ví dụ: Mẫu giáo lớn A1"
              />
              <input
                value={profile.teacher}
                onChange={(e) => onProfileChange({ teacher: e.target.value })}
                className={input}
                placeholder="Giáo viên soạn bài"
              />
            </div>
            <p className="mt-2 text-xs text-stone-500">Lưu ngay trên máy của cô, không gửi lên máy chủ hay cho AI.</p>
          </div>
        </div>
      </section>

      <div className="flex flex-col items-stretch gap-4 border-t border-amber-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-stone-500">🔒 Cô đừng nhập tên hay thông tin cá nhân của trẻ nhé.</p>
        <button
          disabled={loading}
          className="group flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 px-10 py-4 font-display text-xl font-bold text-white shadow-lg shadow-teal-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:translate-y-0 disabled:opacity-60"
        >
          {loading ? (
            <>
              <span className="size-5 animate-spin rounded-full border-[3px] border-white/40 border-t-white" />
              Đang soạn...
            </>
          ) : (
            <>
              <span className="transition group-hover:rotate-12">✨</span> Soạn ngay
            </>
          )}
        </button>
      </div>
    </form>
  );
}
