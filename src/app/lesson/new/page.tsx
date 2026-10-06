"use client";

import { useState } from "react";
import { LessonForm } from "@/components/lesson/LessonForm";
import { LessonView } from "@/components/lesson/LessonView";
import type { DomainId } from "@/lib/curriculum";
import type { LessonRequest } from "@/lib/schemas/lesson";
import { useLessonStream } from "@/hooks/useLessonStream";

export default function NewLessonPage() {
  const { run, regenerate, loading, error, partial, lesson, cached } = useLessonStream();
  const [domain, setDomain] = useState<DomainId>("nhan-thuc");

  function onSubmit(v: LessonRequest) {
    setDomain(v.domain as DomainId);
    void run(v);
    // Trên điện thoại, cuộn xuống khu vực kết quả
    if (window.matchMedia("(max-width: 1023px)").matches) {
      document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <main className="bg-dots">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-extrabold text-ink">
            Soạn giáo án mới <span className="inline-block animate-float [--r:-8deg]">✏️</span>
          </h1>
          <p className="mt-1 text-stone-600">Trả lời vài câu hỏi nhỏ, TeachMate sẽ soạn bản nháp giúp cô.</p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="no-print lg:sticky lg:top-24">
            <LessonForm loading={loading} onSubmit={onSubmit} />
          </div>
          <div id="result" className="scroll-mt-24">
            <LessonView
              partial={partial}
              lesson={lesson}
              loading={loading}
              error={error}
              cached={cached}
              domain={domain}
              onRegenerate={regenerate}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
