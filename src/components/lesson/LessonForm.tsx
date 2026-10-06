"use client";

import { useState } from "react";
import { AGE_GROUPS, DOMAINS } from "@/lib/curriculum";
import type { Profile } from "@/hooks/useProfile";
import { DURATIONS, type FormValues } from "./samples";
import { AGE_EMOJI, DOMAIN_STYLE, THEME_SUGGESTIONS, shortDomainLabel } from "./theme";

const input =
  "w-full rounded-2xl border-2 border-amber-100 bg-white px-4 py-3 text-base text-ink shadow-sm outline-none transition placeholder:text-stone-400 focus:border-teal-400 focus:ring-4 focus:ring-teal-100";

function Label({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <span className="grid size-6 place-items-center rounded-full bg-teal-600 text-xs font-extrabold text-white">
        {n}
      </span>
      <span className="font-display text-lg font-bold text-ink">{children}</span>
    </div>
  );
}

type Props = {
  values: FormValues;
  onChange: (patch: Partial<FormValues>) => void;
  profile: Profile;
  onProfileChange: (patch: Partial<Profile>) => void;
  loading: boolean;
  onSubmit: () => void;
};

export function LessonForm({ values: v, onChange, profile, onProfileChange, loading, onSubmit }: Props) {
  const [showProfile, setShowProfile] = useState(false);
  const age = AGE_GROUPS.find((a) => a.id === v.ageGroup);

  return (
    <form
      id="lesson-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-7 rounded-3xl border-2 border-amber-100 bg-white/80 p-6 shadow-xl shadow-amber-100/60 backdrop-blur"
    >
      <section>
        <Label n={1}>Lớp của cô là?</Label>
        <div className="grid grid-cols-2 gap-2.5">
          {AGE_GROUPS.map((a) => {
            const on = a.id === v.ageGroup;
            return (
              <button
                type="button"
                key={a.id}
                onClick={() => onChange({ ageGroup: a.id })}
                aria-pressed={on}
                className={`rounded-2xl border-2 px-3 py-3 text-left transition hover:-translate-y-0.5 ${
                  on ? "border-teal-400 bg-teal-50 ring-4 ring-teal-100" : "border-amber-100 bg-white hover:border-teal-200"
                }`}
              >
                <span className="text-2xl">{AGE_EMOJI[a.id]}</span>
                <span className="mt-1 block text-sm font-bold leading-tight text-ink">{a.label.split(" (")[0]}</span>
                <span className="text-xs text-stone-500">{a.label.match(/\((.*)\)/)?.[1]}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <Label n={2}>Lĩnh vực phát triển</Label>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {DOMAINS.map((d, i) => {
            const s = DOMAIN_STYLE[d.id];
            const on = d.id === v.domain;
            return (
              <button
                type="button"
                key={d.id}
                onClick={() => onChange({ domain: d.id })}
                aria-pressed={on}
                className={`flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition hover:-translate-y-0.5 ${
                  i === DOMAINS.length - 1 ? "sm:col-span-2" : ""
                } ${on ? `${s.ring} ${s.bg} ring-4` : "border-amber-100 bg-white hover:border-stone-200"}`}
              >
                <span className={`grid size-11 shrink-0 place-items-center rounded-xl text-2xl ${s.bg}`}>
                  {s.emoji}
                </span>
                <span>
                  <span className="block text-sm font-bold leading-tight text-ink">{shortDomainLabel(d.label)}</span>
                  <span className="text-xs text-stone-500">{s.blurb}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <Label n={3}>Chủ đề &amp; hoạt động</Label>
        <input
          required
          maxLength={100}
          value={v.theme}
          onChange={(e) => onChange({ theme: e.target.value })}
          className={input}
          placeholder="Chủ đề, ví dụ: Thế giới động vật"
        />
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {THEME_SUGGESTIONS.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => onChange({ theme: t })}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                v.theme === t ? "bg-teal-600 text-white" : "bg-amber-50 text-amber-800 hover:bg-amber-100"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <input
          maxLength={100}
          value={v.branch}
          onChange={(e) => onChange({ branch: e.target.value })}
          className={`${input} mt-3`}
          placeholder="Chủ đề nhánh / tuần (không bắt buộc)"
        />
        <input
          required
          maxLength={150}
          value={v.activity}
          onChange={(e) => onChange({ activity: e.target.value })}
          className={`${input} mt-3`}
          placeholder="Tên hoạt động, ví dụ: Phân biệt con vật nuôi trong gia đình"
        />
      </section>

      <section>
        <Label n={4}>Thời lượng &amp; ghi chú</Label>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onChange({ duration: "" })}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
              v.duration === "" ? "bg-teal-600 text-white" : "bg-amber-50 text-amber-800 hover:bg-amber-100"
            }`}
          >
            Theo tuổi ({age?.minutes} phút)
          </button>
          {DURATIONS.map((d) => (
            <button
              type="button"
              key={d}
              onClick={() => onChange({ duration: d })}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                v.duration === d ? "bg-teal-600 text-white" : "bg-amber-50 text-amber-800 hover:bg-amber-100"
              }`}
            >
              {d} phút
            </button>
          ))}
        </div>
        <textarea
          rows={2}
          maxLength={500}
          value={v.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          className={`${input} mt-3 resize-none`}
          placeholder="Ghi chú thêm (không bắt buộc): lớp 25 trẻ, có máy chiếu, muốn có trò chơi vận động..."
        />
      </section>

      <section className="rounded-2xl bg-amber-50/70 p-4">
        <button
          type="button"
          onClick={() => setShowProfile((s) => !s)}
          aria-expanded={showProfile}
          className="flex w-full items-center justify-between text-left text-sm font-bold text-amber-900"
        >
          <span>🏫 Thông tin trường &amp; giáo viên (in trên file Word)</span>
          <span className={`transition ${showProfile ? "rotate-180" : ""}`}>⌄</span>
        </button>
        {showProfile && (
          <div className="mt-3 space-y-2.5">
            <input
              value={profile.school}
              onChange={(e) => onProfileChange({ school: e.target.value })}
              className={input}
              placeholder="Tên trường, ví dụ: Trường mầm non Họa Mi"
            />
            <div className="grid gap-2.5 sm:grid-cols-2">
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
            <p className="text-xs text-stone-500">Lưu ngay trên máy của cô, không gửi lên máy chủ hay cho AI.</p>
          </div>
        )}
      </section>

      <div>
        <button
          disabled={loading}
          className="group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-4 font-display text-xl font-bold text-white shadow-lg shadow-teal-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:translate-y-0 disabled:opacity-60"
        >
          {loading ? (
            <>
              <span className="size-5 animate-spin rounded-full border-[3px] border-white/40 border-t-white" />
              Đang soạn giáo án...
            </>
          ) : (
            <>
              <span className="transition group-hover:rotate-12">✨</span> Soạn giáo án ngay
            </>
          )}
        </button>
        <p className="mt-3 text-center text-xs text-stone-500">
          🔒 Cô đừng nhập tên hay thông tin cá nhân của trẻ nhé.
        </p>
      </div>
    </form>
  );
}
