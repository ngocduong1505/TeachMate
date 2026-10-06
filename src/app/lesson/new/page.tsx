"use client";

import { useRef, useState } from "react";
import { Allow, parse } from "partial-json";
import { AGE_GROUPS, DOMAINS } from "@/lib/curriculum";
import { lessonSchema, type Lesson } from "@/lib/schemas/lesson";
import { lessonFileName, lessonToBlob } from "@/lib/docx/lesson";

const field = "w-full rounded-lg border border-gray-300 px-3 py-2";

type PartialLesson = {
  [K in keyof Lesson]?: Lesson[K] extends (infer U)[]
    ? Partial<U>[]
    : Lesson[K] extends object
      ? { [P in keyof Lesson[K]]?: Lesson[K][P] }
      : Lesson[K];
};

function List({ items }: { items?: (string | undefined)[] }) {
  if (!items?.length) return null;
  return (
    <ul className="list-disc space-y-1 pl-6">
      {items.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  );
}

function Sub({ title, items }: { title: string; items?: (string | undefined)[] }) {
  if (!items?.length) return null;
  return (
    <>
      <p className="mt-2 font-medium">{title}</p>
      <List items={items} />
    </>
  );
}

export default function NewLessonPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [partial, setPartial] = useState<PartialLesson | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null); // chỉ có khi stream hoàn tất và hợp lệ
  const [cached, setCached] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const lastInput = useRef<Record<string, unknown> | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    lastInput.current = Object.fromEntries(new FormData(e.currentTarget));
    return generate(false);
  }

  async function generate(fresh: boolean) {
    if (!lastInput.current) return;
    const body = { ...lastInput.current, fresh };
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError(null);
    setLesson(null);
    setPartial(null);
    setCached(false);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Có lỗi xảy ra");
      }

      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = "";
      let json = "";
      let finished = false;
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const ev = JSON.parse(line) as { t: string; d?: string; m?: string };
          if (ev.t === "meta") {
            setCached(!!(ev as { cached?: boolean }).cached);
          } else if (ev.t === "chunk") {
            json += ev.d;
            try {
              setPartial(parse(json, Allow.ALL) as PartialLesson);
            } catch {
              /* chunk cắt giữa token, đợi chunk sau */
            }
          } else if (ev.t === "error") {
            throw new Error(ev.m ?? "Có lỗi xảy ra");
          } else if (ev.t === "done") {
            const result = lessonSchema.safeParse(JSON.parse(json));
            if (!result.success) throw new Error("Giáo án tạo ra không hợp lệ, vui lòng thử lại.");
            setLesson(result.data);
            setPartial(result.data);
            finished = true;
          }
        }
      }
      if (!finished) throw new Error("Kết nối bị gián đoạn, vui lòng thử lại.");
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      if (abortRef.current === ctrl) setLoading(false);
    }
  }

  async function onExport() {
    if (!lesson) return;
    const blob = await lessonToBlob(lesson);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = lessonFileName(lesson);
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-12">
      <h1 className="text-2xl font-bold">Soạn giáo án mới</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-medium">Độ tuổi</span>
            <select name="ageGroup" className={field} defaultValue="mg-4-5">
              {AGE_GROUPS.map((a) => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Lĩnh vực</span>
            <select name="domain" className={field}>
              {DOMAINS.map((d) => (
                <option key={d.id} value={d.id}>{d.label}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Chủ đề</span>
          <input name="theme" required className={field} placeholder="Ví dụ: Thế giới động vật" />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Tên hoạt động</span>
          <input name="activity" required className={field} placeholder="Ví dụ: Phân biệt con vật nuôi trong gia đình" />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Ghi chú (không bắt buộc)</span>
          <textarea name="notes" rows={2} className={field} />
        </label>
        <p className="text-xs text-gray-500">
          Không nhập tên hoặc thông tin cá nhân của trẻ. Kết quả là bản nháp, giáo viên cần kiểm tra lại.
        </p>
        <button
          disabled={loading}
          className="rounded-lg bg-emerald-600 px-6 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "Đang soạn..." : "Tạo giáo án"}
        </button>
      </form>

      {error && <p className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}

      {partial && (
        <article className="space-y-5 rounded-xl border border-gray-200 p-6">
          {cached && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Đây là giáo án đã tạo trước đó cho cùng yêu cầu. Bấm &quot;Tạo bản khác&quot; nếu muốn bản mới.
            </p>
          )}
          <header className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">{partial.title}</h2>
              <p className="text-sm text-gray-600">
                {[partial.ageGroup, partial.domain, partial.theme && `Chủ đề: ${partial.theme}`, partial.duration]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            {lesson ? (
              <div className="flex shrink-0 flex-col items-end gap-2">
              <button
                type="button"
                onClick={onExport}
                className="shrink-0 rounded-lg border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
              >
                Tải file Word
              </button>
              {cached && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => generate(true)}
                  className="text-sm text-gray-600 underline hover:text-gray-900"
                >
                  Tạo bản khác
                </button>
              )}
              </div>
            ) : (
              <span className="shrink-0 animate-pulse text-sm text-gray-500">Đang viết...</span>
            )}
          </header>
          {partial.objectives && (
            <section>
              <h3 className="font-semibold">I. Mục đích yêu cầu</h3>
              <Sub title="1. Kiến thức" items={partial.objectives.knowledge} />
              <Sub title="2. Kỹ năng" items={partial.objectives.skills} />
              <Sub title="3. Thái độ" items={partial.objectives.attitude} />
            </section>
          )}
          {partial.preparation && (
            <section>
              <h3 className="font-semibold">II. Chuẩn bị</h3>
              <Sub title="Của cô" items={partial.preparation.teacher} />
              <Sub title="Của trẻ" items={partial.preparation.children} />
            </section>
          )}
          {!!partial.procedure?.length && (
            <section>
              <h3 className="font-semibold">III. Tiến hành</h3>
              <div className="mt-2 space-y-3">
                {partial.procedure.map((p, i) => (
                  <div key={i} className="rounded-lg bg-gray-50 p-3">
                    <p className="font-medium">{p.step}</p>
                    {p.teacherActions && (
                      <p className="mt-1 text-sm"><b>Hoạt động của cô:</b> {p.teacherActions}</p>
                    )}
                    {p.childrenActions && (
                      <p className="mt-1 text-sm"><b>Hoạt động của trẻ:</b> {p.childrenActions}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
          {partial.extension && (
            <section>
              <h3 className="font-semibold">IV. Mở rộng</h3>
              <p className="mt-2">{partial.extension}</p>
            </section>
          )}
        </article>
      )}
    </main>
  );
}
