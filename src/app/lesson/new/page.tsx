"use client";

import { useEffect, useState } from "react";
import { LessonView } from "@/components/lesson/LessonView";
import { SetupPanel } from "@/components/lesson/SetupPanel";
import { SummaryBar } from "@/components/lesson/SummaryBar";
import { EMPTY_FORM, TYPE_HINTS, type FormValues } from "@/components/lesson/samples";
import { AGE_GROUPS } from "@/lib/curriculum";
import type { DocMeta } from "@/lib/schemas/lesson";
import { useLessonStream } from "@/hooks/useLessonStream";
import { useProfile } from "@/hooks/useProfile";

export default function NewLessonPage() {
  const { run, regenerate, revise, undo, canUndo, versions, revising, reviseError, loading, error, partial, plan, planType, cached } =
    useLessonStream();
  const { profile, update: updateProfile } = useProfile();
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState<FormValues>(EMPTY_FORM); // dữ liệu của lần soạn gần nhất
  const [editing, setEditing] = useState(true); // true: hiện bảng thiết lập đầy đủ; false: thu gọn thành thanh tóm tắt
  const [today, setToday] = useState("");

  // Tính ngày ở client để không lệch giữa server và trình duyệt
  useEffect(() => setToday(new Date().toLocaleDateString("vi-VN")), []);

  const patch = (p: Partial<FormValues>) => setValues((v) => ({ ...v, ...p }));

  function onSubmit() {
    const hint = TYPE_HINTS[values.type];
    setSubmitted(values);
    setEditing(false);
    void run({
      type: values.type,
      ageGroup: values.ageGroup,
      domain: hint.needsDomain ? values.domain : undefined,
      theme: values.theme.trim(),
      branch: values.branch.trim() || undefined,
      activity: hint.needsActivity ? values.activity.trim() : undefined,
      duration: hint.needsDuration && values.duration ? `${values.duration} phút` : undefined,
      notes: values.notes.trim() || undefined,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function edit() {
    setEditing(true);
    requestAnimationFrame(() => document.getElementById("setup")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function startNew() {
    setValues({ ...EMPTY_FORM, type: values.type });
    edit();
  }

  const ageLabel = AGE_GROUPS.find((a) => a.id === submitted.ageGroup)?.label ?? "";
  const meta: DocMeta = {
    school: profile.school,
    group: profile.group,
    className: profile.className ? `${profile.className} (${ageLabel.match(/\((.*)\)/)?.[1] ?? ""})` : ageLabel,
    teacher: profile.teacher,
    date: today,
  };
  const hasResult = !!partial || loading || !!error;

  return (
    <main className="bg-dots">
      <div className="mx-auto max-w-[1760px] space-y-6 px-5 py-10 sm:px-8 2xl:px-12">
        <div>
          <h1 className="font-display text-4xl font-extrabold text-ink">
            Soạn kế hoạch mới <span className="inline-block animate-float [--r:-8deg]">✏️</span>
          </h1>
          <p className="mt-1 text-stone-600">Chọn loại kế hoạch, điền vài thông tin, TeachMate sẽ soạn bản nháp giúp cô.</p>
        </div>

        {hasResult && !editing && <SummaryBar values={submitted} loading={loading} onEdit={edit} onNew={startNew} />}

        {(editing || !hasResult) && (
          <SetupPanel
            values={values}
            onChange={patch}
            onPickSample={setValues}
            profile={profile}
            onProfileChange={updateProfile}
            loading={loading}
            onSubmit={onSubmit}
          />
        )}

        {hasResult && (
          <div id="result" className="mx-auto max-w-[1280px] scroll-mt-40">
            <LessonView
              partial={partial}
              plan={plan}
              planType={planType}
              loading={loading}
              error={error}
              cached={cached}
              domain={submitted.domain}
              meta={meta}
              onRegenerate={regenerate}
              onRevise={revise}
              onUndo={undo}
              canUndo={canUndo}
              versions={versions}
              revising={revising}
              reviseError={reviseError}
            />
          </div>
        )}
      </div>
    </main>
  );
}
