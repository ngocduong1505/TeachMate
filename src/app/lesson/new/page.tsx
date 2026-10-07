"use client";

import { useEffect, useRef, useState } from "react";
import { LessonView } from "@/components/lesson/LessonView";
import { SetupPanel } from "@/components/lesson/SetupPanel";
import { SummaryBar } from "@/components/lesson/SummaryBar";
import { DEMO_FORM, EMPTY_FORM, TYPE_HINTS, type FormValues } from "@/components/lesson/samples";
import { SAMPLE_PLANS } from "@/lib/samples/plans";
import type { LessonRequest } from "@/lib/schemas/lesson";
import { AGE_GROUPS } from "@/lib/curriculum";
import type { DocMeta } from "@/lib/schemas/lesson";
import { useLessonStream } from "@/hooks/useLessonStream";
import { useProfile } from "@/hooks/useProfile";
import { useExportTemplate } from "@/hooks/useExportTemplate";
import { getPlan, savePlan, updatePlan } from "@/lib/library";
import { profileToClassInfo } from "@/lib/profiles";

export default function NewLessonPage() {
  const { run, regenerate, revise, adapt, origin, undo, load, demo, canUndo, versions, revising, reviseError, loading, error, partial, plan, planType, cached } =
    useLessonStream();
  const profileState = useProfile();
  const { template, update: updateTemplate } = useExportTemplate();
  const { profile, update: updateProfile } = profileState;
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState<FormValues>(EMPTY_FORM); // dữ liệu của lần soạn gần nhất
  const [editing, setEditing] = useState(true); // true: hiện bảng thiết lập đầy đủ; false: thu gọn thành thanh tóm tắt
  const [today, setToday] = useState("");

  // Tính ngày ở client để không lệch giữa server và trình duyệt
  useEffect(() => setToday(new Date().toLocaleDateString("vi-VN")), []);

  // Tự lưu vào thư viện khi giáo án hoàn tất; chỉnh sửa/hoàn tác thì cập nhật cùng bản đã lưu.
  // Các thao tác lưu chạy lần lượt để không tạo trùng bản.
  const savedId = useRef<string | null>(null);
  const savedPlan = useRef<unknown>(null);
  const lastOrigin = useRef(0);
  const pendingAdapt = useRef<FormValues | null>(null);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  useEffect(() => {
    if (!plan) {
      savedId.current = null; // bắt đầu soạn bản mới
      savedPlan.current = null;
      return;
    }
    if (demo || plan === savedPlan.current) return;
    savedPlan.current = plan;
    // Chuyển sang độ tuổi khác: lưu thành bản mới với thông tin của lớp mới
    let form = submitted;
    if (origin !== lastOrigin.current) {
      lastOrigin.current = origin;
      savedId.current = null;
      if (pendingAdapt.current) {
        form = pendingAdapt.current;
        pendingAdapt.current = null;
        setSubmitted(form);
      }
    }
    const entry = { type: planType, title: plan.title, form, request: toRequest(form), plan };
    saveQueue.current = saveQueue.current
      .then(async () => {
        if (savedId.current && (await updatePlan(savedId.current, { plan, title: plan.title }))) return;
        savedId.current = await savePlan(entry);
      })
      .catch((e) => console.error("save plan failed", e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, demo, origin]);

  // Mở giáo án đã lưu từ thư viện: /lesson/new?open=<id>
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("open");
    if (!id) return;
    void getPlan(id)
      .then((item) => {
        if (!item) return;
        savedId.current = item.id;
        savedPlan.current = item.plan;
        setValues(item.form);
        setSubmitted(item.form);
        setEditing(false);
        load(item.request, item.plan, false);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patch = (p: Partial<FormValues>) => setValues((v) => ({ ...v, ...p }));

  function toRequest(v: FormValues): LessonRequest {
    const hint = TYPE_HINTS[v.type];
    return {
      type: v.type,
      ageGroup: v.ageGroup,
      domain: hint.needsDomain ? v.domain : undefined,
      theme: v.theme.trim(),
      branch: v.branch.trim() || undefined,
      activity: hint.needsActivity ? v.activity.trim() : undefined,
      duration: hint.needsDuration && v.duration ? `${v.duration} phút` : undefined,
      notes: v.notes.trim() || undefined,
      classInfo: profileToClassInfo(profile),
    };
  }

  function onSubmit() {
    setSubmitted(values);
    setEditing(false);
    void run(toRequest(values));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /** Xem ngay giáo án mẫu của loại đang chọn (không gọi AI). */
  function onDemo() {
    const form = DEMO_FORM[values.type];
    setValues(form);
    setSubmitted(form);
    setEditing(false);
    load(toRequest(form), SAMPLE_PLANS[form.type]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /** Chuyển giáo án đang xem sang độ tuổi khác (AI điều chỉnh, lưu thành bản mới). */
  function onAdapt(ageGroup: FormValues["ageGroup"]) {
    const next = { ...submitted, ageGroup, duration: "" };
    const age = AGE_GROUPS.find((a) => a.id === ageGroup);
    pendingAdapt.current = next;
    adapt(
      toRequest(next),
      `Chuyển giáo án này sang ${age?.label}. Giữ nguyên chủ đề và hoạt động chính; điều chỉnh mục tiêu, mức độ khó, thời lượng (${age?.minutes} phút), đồ dùng, cách tổ chức và ngôn ngữ cho phù hợp độ tuổi mới. Cập nhật trường ageGroup và duration.`,
    );
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
    template,
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
            onDemo={onDemo}
            profile={profile}
            onProfileChange={updateProfile}
            years={profileState.years}
            onSwitchYear={profileState.switchYear}
            profileSaved={profileState.saved}
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
              demo={demo}
              domain={submitted.domain}
              meta={meta}
              onRegenerate={regenerate}
              ageGroup={submitted.ageGroup}
              onAdapt={onAdapt}
              onTemplateChange={updateTemplate}
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
