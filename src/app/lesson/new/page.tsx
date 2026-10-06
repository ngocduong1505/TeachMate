"use client";

import { useState } from "react";
import { AGE_GROUPS, DOMAINS } from "@/lib/curriculum";
import type { Lesson } from "@/lib/schemas/lesson";
import { lessonFileName, lessonToBlob } from "@/lib/docx/lesson";

const field = "w-full rounded-lg border border-gray-300 px-3 py-2";

function List({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1 pl-6">
      {items.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  );
}

export default function NewLessonPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.currentTarget));
    setLoading(true);
    setError(null);
    setLesson(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Có lỗi xảy ra");
      setLesson(data.lesson);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
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

      {lesson && (
        <article className="space-y-5 rounded-xl border border-gray-200 p-6">
          <header className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">{lesson.title}</h2>
              <p className="text-sm text-gray-600">
                {lesson.ageGroup} · {lesson.domain} · Chủ đề: {lesson.theme} · {lesson.duration}
              </p>
            </div>
            <button
              type="button"
              onClick={onExport}
              className="shrink-0 rounded-lg border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
            >
              Tải file Word
            </button>
          </header>
          <section>
            <h3 className="font-semibold">I. Mục đích yêu cầu</h3>
            <p className="mt-2 font-medium">1. Kiến thức</p><List items={lesson.objectives.knowledge} />
            <p className="mt-2 font-medium">2. Kỹ năng</p><List items={lesson.objectives.skills} />
            <p className="mt-2 font-medium">3. Thái độ</p><List items={lesson.objectives.attitude} />
          </section>
          <section>
            <h3 className="font-semibold">II. Chuẩn bị</h3>
            <p className="mt-2 font-medium">Của cô</p><List items={lesson.preparation.teacher} />
            <p className="mt-2 font-medium">Của trẻ</p><List items={lesson.preparation.children} />
          </section>
          <section>
            <h3 className="font-semibold">III. Tiến hành</h3>
            <div className="mt-2 space-y-3">
              {lesson.procedure.map((p, i) => (
                <div key={i} className="rounded-lg bg-gray-50 p-3">
                  <p className="font-medium">{p.step}</p>
                  <p className="mt-1 text-sm"><b>Hoạt động của cô:</b> {p.teacherActions}</p>
                  <p className="mt-1 text-sm"><b>Hoạt động của trẻ:</b> {p.childrenActions}</p>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h3 className="font-semibold">IV. Mở rộng</h3>
            <p className="mt-2">{lesson.extension}</p>
          </section>
        </article>
      )}
    </main>
  );
}
