"use client";

import { AGE_GROUPS, DOMAINS, planTypeById } from "@/lib/curriculum";
import { TYPE_HINTS, type FormValues } from "./samples";
import { DOMAIN_STYLE, TYPE_STYLE, shortDomainLabel } from "./theme";

/** Thanh tóm tắt thông tin đã nhập, hiện khi form được thu gọn để kết quả chiếm toàn bộ chiều rộng. */
export function SummaryBar({
  values: v,
  loading,
  onEdit,
  onNew,
}: {
  values: FormValues;
  loading: boolean;
  onEdit: () => void;
  onNew: () => void;
}) {
  const type = planTypeById(v.type);
  const style = TYPE_STYLE[v.type];
  const age = AGE_GROUPS.find((a) => a.id === v.ageGroup)?.label.split(" (")[0];
  const domain = TYPE_HINTS[v.type].needsDomain ? DOMAINS.find((d) => d.id === v.domain) : undefined;
  const dStyle = domain ? DOMAIN_STYLE[domain.id] : undefined;

  return (
    <div className="no-print sticky top-[4.25rem] z-20 animate-rise rounded-2xl border-2 border-amber-100 bg-white/90 px-4 py-3 shadow-lg shadow-amber-100/50 backdrop-blur">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className={`rounded-full px-3.5 py-1.5 text-sm font-bold ${style.chip}`}>
          {style.emoji} {type?.label}
        </span>
        <span className="rounded-full bg-amber-50 px-3.5 py-1.5 text-sm font-semibold text-amber-900">{age}</span>
        {domain && dStyle && (
          <span className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${dStyle.chip}`}>
            {dStyle.emoji} {shortDomainLabel(domain.label)}
          </span>
        )}
        <span className="min-w-0 max-w-full truncate text-sm font-semibold text-stone-700">
          {v.theme}
          {v.branch && ` › ${v.branch}`}
          {v.activity && ` › ${v.activity}`}
        </span>
        <span className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={onEdit}
            disabled={loading}
            className="rounded-full bg-teal-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-50"
          >
            ✏️ Chỉnh thông tin
          </button>
          <button
            type="button"
            onClick={onNew}
            disabled={loading}
            className="rounded-full bg-white px-4 py-2 text-sm font-bold text-stone-700 ring-1 ring-amber-200 transition hover:bg-amber-50 disabled:opacity-50"
          >
            ➕ Soạn mới
          </button>
        </span>
      </div>
    </div>
  );
}
