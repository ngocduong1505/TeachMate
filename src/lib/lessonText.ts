import type { CornerPlan, Lesson, OutdoorPlan, Plan, PlanType, WeeklyPlan } from "@/lib/schemas/lesson";

const list = (items: string[]) => items.map((t) => `- ${t}`).join("\n");

function steps(l: Lesson | CornerPlan | OutdoorPlan) {
  return l.procedure.map(
    (p, i) => `${i + 1}. ${p.step} (${p.time})\n* Hoạt động của cô:\n${p.teacherActions}\n* Hoạt động của trẻ:\n${p.childrenActions}`,
  );
}

function objectives(l: Lesson | CornerPlan | OutdoorPlan) {
  return [
    "I. MỤC ĐÍCH - YÊU CẦU",
    "1. Kiến thức",
    list(l.objectives.knowledge),
    "2. Kỹ năng",
    list(l.objectives.skills),
    "3. Thái độ",
    list(l.objectives.attitude),
    "",
    "II. CHUẨN BỊ",
    "1. Đồ dùng của cô giáo",
    list(l.preparation.teacher),
    "2. Đồ dùng của trẻ",
    list(l.preparation.children),
  ];
}

function weeklyText(w: WeeklyPlan) {
  return [
    `KẾ HOẠCH TUẦN: ${w.title}`,
    `Độ tuổi: ${w.ageGroup} | Chủ đề: ${w.theme} | Chủ đề nhánh: ${w.branch}`,
    "",
    "I. MỤC TIÊU",
    ...w.goals.map((g) => `* ${g.domain}\n${list(g.content)}`),
    "",
    "II. CHUẨN BỊ",
    list(w.preparation),
    "",
    "III. HOẠT ĐỘNG TRONG TUẦN",
    ...w.days.map(
      (d) =>
        `* ${d.day}\n- Đón trẻ: ${d.welcome}\n- Thể dục sáng: ${d.morningExercise}\n- Hoạt động học: ${d.learning}\n- Ngoài trời: ${d.outdoor}\n- Hoạt động góc: ${d.corners}\n- Chiều: ${d.afternoon}`,
    ),
    "",
    "IV. GHI CHÚ",
    w.notes,
  ].join("\n");
}

/** Văn bản thuần để sao chép dán vào Zalo, Word, Google Docs... */
export function planToText(type: PlanType, plan: Plan) {
  if (type === "weekly") return weeklyText(plan as WeeklyPlan);
  const l = plan as Lesson;
  const head = [
    `${type === "corner" ? "KẾ HOẠCH HOẠT ĐỘNG GÓC" : type === "outdoor" ? "KẾ HOẠCH HOẠT ĐỘNG NGOÀI TRỜI" : "GIÁO ÁN"}: ${l.title}`,
    `Lĩnh vực: ${l.domain} | Chủ đề: ${l.theme} | Độ tuổi: ${l.ageGroup} | Thời gian: ${l.duration}`,
    "",
    ...objectives(l),
    "",
  ];
  const extra =
    type === "corner"
      ? [
          "III. CÁC GÓC CHƠI",
          ...(plan as CornerPlan).corners.map(
            (c) => `* ${c.name}\nNội dung: ${c.content}\nĐồ dùng:\n${list(c.materials)}\nCô hướng dẫn: ${c.teacherGuide}`,
          ),
          "",
        ]
      : type === "outdoor"
        ? ["III. LƯU Ý AN TOÀN", list((plan as OutdoorPlan).safety), ""]
        : [];
  const n = extra.length ? "IV" : "III";
  return [
    ...head,
    ...extra,
    `${n}. TIẾN TRÌNH TỔ CHỨC HOẠT ĐỘNG`,
    ...steps(l),
    "",
    `${extra.length ? "V" : "IV"}. HOẠT ĐỘNG MỞ RỘNG`,
    l.extension,
  ].join("\n");
}
