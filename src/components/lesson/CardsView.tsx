import type { DeepPartial, Lesson } from "@/lib/schemas/lesson";

/** Dạng thẻ nhiều màu, dễ đọc trên điện thoại (chỉ cho tiết học). */
export function CardsView({ partial }: { partial: DeepPartial<Lesson> }) {
  return (
    <div className="space-y-4 p-6">
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
          <ol className="relative space-y-5 before:absolute before:bottom-3 before:left-4 before:top-3 before:border-l-2 before:border-dashed before:border-sky-200">
            {partial.procedure.map((p, i) => (
              <li key={i} className="relative animate-rise pl-12">
                <span className="absolute left-0 top-0 grid size-8 place-items-center rounded-full bg-sky-500 text-sm font-extrabold text-white ring-4 ring-sky-50">
                  {i + 1}
                </span>
                <h4 className="flex min-h-8 flex-wrap items-center gap-x-2 gap-y-1 font-display text-lg font-bold text-ink">
                  {p.step}
                  {p.time && (
                    <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-bold text-sky-700">
                      ⏱ {p.time}
                    </span>
                  )}
                </h4>
                <div className="mt-2 grid gap-3 md:grid-cols-2">
                  {p.teacherActions && (
                    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-sky-100">
                      <p className="mb-1 text-xs font-extrabold uppercase tracking-wide text-sky-600">👩‍🏫 Hoạt động của cô</p>
                      <p className="whitespace-pre-line text-base leading-relaxed text-stone-700">{p.teacherActions}</p>
                    </div>
                  )}
                  {p.childrenActions && (
                    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-pink-100">
                      <p className="mb-1 text-xs font-extrabold uppercase tracking-wide text-pink-600">🧒 Hoạt động của trẻ</p>
                      <p className="whitespace-pre-line text-base leading-relaxed text-stone-700">{p.childrenActions}</p>
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
  );
}

function Section({ emoji, title, tint, children }: { emoji: string; title: string; tint: string; children: React.ReactNode }) {
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
          <li key={i} className="flex gap-2.5 text-base leading-relaxed text-stone-700">
            <span className={`mt-2 size-2 shrink-0 rounded-full ${dot}`} />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
