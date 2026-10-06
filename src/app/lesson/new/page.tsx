"use client";

import { useEffect, useState } from "react";
import { LessonForm } from "@/components/lesson/LessonForm";
import { LessonView } from "@/components/lesson/LessonView";
import { SampleStrip } from "@/components/lesson/SampleStrip";
import { EMPTY_FORM, type FormValues } from "@/components/lesson/samples";
import { AGE_GROUPS } from "@/lib/curriculum";
import type { DocMeta } from "@/lib/schemas/lesson";
import { useLessonStream } from "@/hooks/useLessonStream";
import { useProfile } from "@/hooks/useProfile";

export default function NewLessonPage() {
  const { run, regenerate, loading, error, partial, lesson, cached } = useLessonStream();
  const { profile, update: updateProfile } = useProfile();
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState<FormValues>(EMPTY_FORM); // dữ liệu của lần soạn gần nhất
  const [today, setToday] = useState("");

  // Tính ngày ở client để không lệch giữa server và trình duyệt
  useEffect(() => setToday(new Date().toLocaleDateString("vi-VN")), []);

  const patch = (p: Partial<FormValues>) => setValues((v) => ({ ...v, ...p }));

  function pick(v: FormValues) {
    setValues(v);
    document.getElementById("lesson-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function onSubmit() {
    setSubmitted(values);
    void run({
      ageGroup: values.ageGroup,
      domain: values.domain,
      theme: values.theme.trim(),
      branch: values.branch.trim() || undefined,
      activity: values.activity.trim(),
      duration: values.duration ? `${values.duration} phút` : undefined,
      notes: values.notes.trim() || undefined,
    });
    // Trên màn hình hẹp, cuộn xuống khu vực kết quả
    if (window.matchMedia("(max-width: 1023px)").matches) {
      document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const ageLabel = AGE_GROUPS.find((a) => a.id === submitted.ageGroup)?.label ?? "";
  const meta: DocMeta = {
    school: profile.school,
    className: profile.className ? `${profile.className} (${ageLabel.match(/\((.*)\)/)?.[1] ?? ""})` : ageLabel,
    teacher: profile.teacher,
    date: today,
  };

  return (
    <main className="bg-dots">
      <div className="mx-auto max-w-[1760px] px-5 py-10 sm:px-8 2xl:px-12">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-extrabold text-ink">
            Soạn giáo án mới <span className="inline-block animate-float [--r:-8deg]">✏️</span>
          </h1>
          <p className="mt-1 text-stone-600">Trả lời vài câu hỏi nhỏ, TeachMate sẽ soạn bản nháp giúp cô.</p>
        </div>

        <div className="no-print mb-8">
          <SampleStrip onPick={pick} />
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] 2xl:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] 2xl:gap-10">
          <div className="no-print lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:rounded-3xl lg:pb-2">
            <LessonForm
              values={values}
              onChange={patch}
              profile={profile}
              onProfileChange={updateProfile}
              loading={loading}
              onSubmit={onSubmit}
            />
          </div>
          <div id="result" className="scroll-mt-24">
            <LessonView
              partial={partial}
              lesson={lesson}
              loading={loading}
              error={error}
              cached={cached}
              domain={submitted.domain}
              meta={meta}
              onRegenerate={regenerate}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
