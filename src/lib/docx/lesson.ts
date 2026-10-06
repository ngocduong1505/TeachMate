import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  PageOrientation,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";
import { planTypeById } from "@/lib/curriculum";
import type { CornerPlan, DocMeta, Lesson, OutdoorPlan, Plan, PlanType, WeeklyPlan } from "@/lib/schemas/lesson";

const FONT = "Times New Roman";
const SIZE = 26; // 13pt

type Align = (typeof AlignmentType)[keyof typeof AlignmentType];
type RunOpts = { bold?: boolean; italics?: boolean; size?: number };
type Block = Paragraph | Table;

const run = (text: string, o: RunOpts = {}) =>
  new TextRun({ text, font: FONT, size: o.size ?? SIZE, bold: o.bold, italics: o.italics });

const para = (text: string, o: RunOpts & { align?: Align; after?: number } = {}) =>
  new Paragraph({ alignment: o.align, children: [run(text, o)], spacing: { after: o.after ?? 80 } });

const heading = (text: string) =>
  new Paragraph({ children: [run(text, { bold: true })], spacing: { before: 200, after: 100 }, keepNext: true });

const stripMark = (t: string) => t.replace(/^\s*[-•*]\s+/, "");

const bullets = (items: string[]) =>
  items.map((t) => new Paragraph({ children: [run(stripMark(t))], bullet: { level: 0 }, spacing: { after: 40 } }));

const NONE = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: NONE, bottom: NONE, left: NONE, right: NONE, insideHorizontal: NONE, insideVertical: NONE };
const LINE = { style: BorderStyle.SINGLE, size: 4, color: "000000" };
const gridBorders = { top: LINE, bottom: LINE, left: LINE, right: LINE, insideHorizontal: LINE, insideVertical: LINE };
const MARGINS = { top: 60, bottom: 60, left: 100, right: 100 };

/** Mỗi dòng (tách bằng \n) là một đoạn; bỏ dòng trống. */
const lines = (text: string) =>
  (text ?? "")
    .split("\n")
    .map((l) => l.trimEnd())
    .filter(Boolean)
    .map((l) => new Paragraph({ children: [run(l)], spacing: { after: 40 } }));

const cell = (width: number, children: Paragraph[], extra: { fill?: string } = {}) =>
  new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    margins: MARGINS,
    verticalAlign: VerticalAlign.TOP,
    shading: extra.fill ? { fill: extra.fill } : undefined,
    children,
  });

const headCell = (width: number, text: string) =>
  cell(width, [para(text, { bold: true, align: AlignmentType.CENTER })], { fill: "F2F2F2" });

const grid = (rows: TableRow[]) => new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders: gridBorders, rows });

const DOTS = "...............................";

/** Đầu trang theo khung kế hoạch bài dạy (Phụ lục IV, CV 5512/BGDĐT-GDTrH): Trường, Tổ | Họ và tên giáo viên. */
function headerBlock(meta: DocMeta) {
  const left = [
    para(`Trường: ${meta.school || DOTS}`, { bold: true, after: 40 }),
    para(`Tổ: ${meta.group || DOTS}`, { bold: true }),
  ];
  const right = [para(`Họ và tên giáo viên: ${meta.teacher || DOTS}`, { bold: true })];
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorders,
    rows: [new TableRow({ children: [cell(48, left), cell(52, right)] })],
  });
}

function signatureBlock(meta: DocMeta) {
  const centered = (text: string, o: RunOpts = {}) => para(text, { ...o, align: AlignmentType.CENTER });
  const left = [
    centered("NGƯỜI DUYỆT GIÁO ÁN", { bold: true }),
    centered("(Tổ trưởng chuyên môn / Ban Giám Hiệu)", { italics: true }),
  ];
  const right = [
    centered(meta.date ? `Ngày ${meta.date}` : "Ngày ..... tháng ..... năm .....", { italics: true }),
    centered("GIÁO VIÊN SOẠN BÀI", { bold: true }),
    centered("(Ký và ghi rõ họ tên)", { italics: true }),
    ...(meta.teacher ? [centered(" "), centered(" "), centered(meta.teacher, { bold: true })] : []),
  ];
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorders,
    rows: [new TableRow({ cantSplit: true, children: [cell(50, left), cell(50, right)] })],
  });
}

const dots = (n: number) =>
  Array.from({ length: n }, () => para("……………………………………………………………………………………………………………………", { after: 60 }));

function infoLines(items: [string, string | undefined][]) {
  return items.filter(([, v]) => v).map(([k, v]) => para(`${k}: ${v}`));
}

function objectivesAndPrep(l: Lesson | CornerPlan | OutdoorPlan): Block[] {
  return [
    heading("I. MỤC ĐÍCH - YÊU CẦU"),
    para("1. Kiến thức", { bold: true }),
    ...bullets(l.objectives.knowledge),
    para("2. Kỹ năng", { bold: true }),
    ...bullets(l.objectives.skills),
    para("3. Thái độ", { bold: true }),
    ...bullets(l.objectives.attitude),
    heading("II. CHUẨN BỊ"),
    para("1. Đồ dùng của cô giáo:", { bold: true }),
    ...bullets(l.preparation.teacher),
    para("2. Đồ dùng của trẻ:", { bold: true }),
    ...bullets(l.preparation.children),
  ];
}

function procedureTable(steps: Lesson["procedure"]) {
  const head = new TableRow({
    tableHeader: true,
    children: [headCell(18, "Các bước & Thời gian"), headCell(41, "Hoạt động của cô giáo"), headCell(41, "Hoạt động của trẻ")],
  });
  const rows = steps.map(
    (s, i) =>
      new TableRow({
        children: [
          cell(18, [
            new Paragraph({ children: [run(`${i + 1}. ${s.step}`, { bold: true })], spacing: { after: 40 } }),
            new Paragraph({ children: [run(s.time, { italics: true })] }),
          ]),
          cell(41, lines(s.teacherActions)),
          cell(41, lines(s.childrenActions)),
        ],
      }),
  );
  return grid([head, ...rows]);
}

function cornersTable(corners: CornerPlan["corners"]) {
  const head = new TableRow({
    tableHeader: true,
    children: [headCell(16, "Góc chơi"), headCell(28, "Nội dung chơi"), headCell(24, "Đồ dùng"), headCell(32, "Cô hướng dẫn")],
  });
  const rows = corners.map(
    (c) =>
      new TableRow({
        children: [
          cell(16, [para(c.name, { bold: true })]),
          cell(28, lines(c.content)),
          cell(24, bullets(c.materials)),
          cell(32, lines(c.teacherGuide)),
        ],
      }),
  );
  return grid([head, ...rows]);
}

function weeklyTables(w: WeeklyPlan): Block[] {
  const rowsDef: [string, keyof WeeklyPlan["days"][number]][] = [
    ["Đón trẻ, trò chuyện", "welcome"],
    ["Thể dục sáng", "morningExercise"],
    ["Hoạt động học", "learning"],
    ["Hoạt động ngoài trời", "outdoor"],
    ["Hoạt động góc", "corners"],
    ["Hoạt động chiều", "afternoon"],
  ];
  const colW = Math.floor(82 / Math.max(w.days.length, 1));
  const head = new TableRow({
    tableHeader: true,
    children: [headCell(18, "Hoạt động"), ...w.days.map((d) => headCell(colW, d.day))],
  });
  const rows = rowsDef.map(
    ([label, key]) =>
      new TableRow({
        children: [cell(18, [para(label, { bold: true })]), ...w.days.map((d) => cell(colW, lines(d[key])))],
      }),
  );
  return [grid([head, ...rows])];
}

function typeBody(type: PlanType, plan: Plan): Block[] {
  if (type === "weekly") {
    const w = plan as WeeklyPlan;
    return [
      heading("I. MỤC TIÊU THEO LĨNH VỰC"),
      ...w.goals.flatMap((g) => [para(g.domain, { bold: true }), ...bullets(g.content)]),
      heading("II. CHUẨN BỊ"),
      ...bullets(w.preparation),
      heading("III. HOẠT ĐỘNG TRONG TUẦN"),
      ...weeklyTables(w),
      heading("IV. GHI CHÚ, PHỐI HỢP VỚI PHỤ HUYNH"),
      ...lines(w.notes),
    ];
  }
  const l = plan as Lesson;
  if (type === "corner") {
    const c = plan as CornerPlan;
    return [
      ...objectivesAndPrep(c),
      heading("III. CÁC GÓC CHƠI"),
      cornersTable(c.corners),
      heading("IV. TIẾN TRÌNH TỔ CHỨC HOẠT ĐỘNG"),
      procedureTable(c.procedure),
      heading("V. GỢI Ý MỞ RỘNG"),
      ...lines(c.extension),
      heading("VI. ĐÁNH GIÁ VÀ RÚT KINH NGHIỆM"),
      ...dots(3),
    ];
  }
  if (type === "outdoor") {
    const o = plan as OutdoorPlan;
    return [
      ...objectivesAndPrep(o),
      heading("III. LƯU Ý AN TOÀN"),
      ...bullets(o.safety),
      heading("IV. TIẾN TRÌNH TỔ CHỨC HOẠT ĐỘNG"),
      procedureTable(o.procedure),
      heading("V. GỢI Ý MỞ RỘNG"),
      ...lines(o.extension),
      heading("VI. ĐÁNH GIÁ VÀ RÚT KINH NGHIỆM"),
      ...dots(3),
    ];
  }
  return [
    ...objectivesAndPrep(l),
    heading("III. TIẾN TRÌNH TỔ CHỨC HOẠT ĐỘNG"),
    procedureTable(l.procedure),
    heading("IV. HOẠT ĐỘNG MỞ RỘNG"),
    ...lines(l.extension),
    heading("V. ĐÁNH GIÁ VÀ RÚT KINH NGHIỆM SAU TIẾT DẠY"),
    ...dots(3),
  ];
}

export function planToDocument(type: PlanType, plan: Plan, meta: DocMeta = {}) {
  const info = planTypeById(type);
  const p = plan as Lesson & WeeklyPlan;
  const landscape = type === "weekly";
  return new Document({
    creator: "TeachMate",
    title: p.title,
    sections: [
      {
        properties: {
          page: {
            size: landscape ? { orientation: PageOrientation.LANDSCAPE } : undefined,
            margin: { top: 1134, bottom: 1134, left: landscape ? 1134 : 1701, right: 1134 },
          },
        },
        children: [
          headerBlock(meta),
          para(" ", { after: 80 }),
          para(info?.doc ?? "KẾ HOẠCH", { bold: true, size: 32, align: AlignmentType.CENTER, after: 60 }),
          para(`${type === "weekly" ? "TÊN KẾ HOẠCH" : "TÊN BÀI DẠY"}: ${p.title.toUpperCase()}`, {
            bold: true,
            align: AlignmentType.CENTER,
            after: 60,
          }),
          para(
            type === "weekly"
              ? `Lớp: ${meta.className || DOTS}`
              : `Lĩnh vực/Hoạt động giáo dục: ${p.domain}; lớp: ${meta.className || DOTS}`,
            { align: AlignmentType.CENTER, after: 40 },
          ),
          ...(type === "weekly" ? [] : [para(`Thời gian thực hiện: ${p.duration}`, { align: AlignmentType.CENTER, after: 160 })]),
          ...infoLines([
            ["Chủ đề", p.theme],
            ["Chủ đề nhánh", type === "weekly" ? p.branch : undefined],
            ["Độ tuổi", p.ageGroup],
            ["Ngày soạn", meta.date],
          ]),
          ...typeBody(type, plan),
          para(" ", { after: 120 }),
          signatureBlock(meta),
        ],
      },
    ],
  });
}

export async function planToBlob(type: PlanType, plan: Plan, meta: DocMeta = {}) {
  return Packer.toBlob(planToDocument(type, plan, meta));
}

export function planFileName(type: PlanType, plan: Plan) {
  const prefix = { lesson: "Giao an", corner: "Hoat dong goc", outdoor: "Ngoai troi", weekly: "Ke hoach tuan" }[type];
  const base = (plan as { title: string }).title
    .normalize("NFC")
    .replace(/[\\/:*?"<>|]/g, "")
    .trim()
    .slice(0, 80);
  return `${prefix} - ${base || "TeachMate"}.docx`;
}
