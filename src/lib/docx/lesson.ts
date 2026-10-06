import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";
import type { DocMeta, Lesson } from "@/lib/schemas/lesson";

const FONT = "Times New Roman";
const SIZE = 26; // 13pt

type RunOpts = { bold?: boolean; italics?: boolean; size?: number };
const run = (text: string, o: RunOpts = {}) =>
  new TextRun({ text, font: FONT, size: o.size ?? SIZE, bold: o.bold, italics: o.italics });

const para = (text: string, o: RunOpts & { align?: (typeof AlignmentType)[keyof typeof AlignmentType]; after?: number } = {}) =>
  new Paragraph({ alignment: o.align, children: [run(text, o)], spacing: { after: o.after ?? 80 } });

const heading = (text: string) =>
  new Paragraph({ children: [run(text, { bold: true })], spacing: { before: 200, after: 100 }, keepNext: true });

const bullets = (items: string[]) =>
  items.map((t) => new Paragraph({ children: [run(t)], bullet: { level: 0 }, spacing: { after: 40 } }));

const NONE = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: NONE, bottom: NONE, left: NONE, right: NONE, insideHorizontal: NONE, insideVertical: NONE };
const LINE = { style: BorderStyle.SINGLE, size: 4, color: "000000" };
const gridBorders = { top: LINE, bottom: LINE, left: LINE, right: LINE, insideHorizontal: LINE, insideVertical: LINE };
const MARGINS = { top: 60, bottom: 60, left: 100, right: 100 };

/** Mỗi dòng (tách bằng \n) là một đoạn; bỏ dòng trống. */
const lines = (text: string) =>
  text
    .split("\n")
    .map((l) => l.trimEnd())
    .filter(Boolean)
    .map((l) => new Paragraph({ children: [run(l)], spacing: { after: 40 } }));

const cell = (width: number, children: Paragraph[], extra: { fill?: string; align?: "center" } = {}) =>
  new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    margins: MARGINS,
    verticalAlign: VerticalAlign.TOP,
    shading: extra.fill ? { fill: extra.fill } : undefined,
    children,
  });

function headerBlock(meta: DocMeta) {
  const left = [
    para(`ĐƠN VỊ: ${(meta.school || "...............................").toUpperCase()}`, { bold: true, after: 40 }),
    para(`LỚP: ${meta.className || "..............................."}`, { bold: true }),
  ];
  const right = [
    para("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", { bold: true, align: AlignmentType.CENTER, after: 40 }),
    para("Độc lập - Tự do - Hạnh phúc", { bold: true, align: AlignmentType.CENTER }),
  ];
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorders,
    rows: [new TableRow({ children: [cell(45, left), cell(55, right)] })],
  });
}

function procedureTable(steps: Lesson["procedure"]) {
  const head = new TableRow({
    tableHeader: true,
    children: [
      cell(18, [para("Các bước & Thời gian", { bold: true, align: AlignmentType.CENTER })], { fill: "F2F2F2" }),
      cell(41, [para("Hoạt động của cô giáo", { bold: true, align: AlignmentType.CENTER })], { fill: "F2F2F2" }),
      cell(41, [para("Hoạt động của trẻ", { bold: true, align: AlignmentType.CENTER })], { fill: "F2F2F2" }),
    ],
  });
  const rows = steps.map(
    (s, i) =>
      new TableRow({
        cantSplit: false,
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
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders: gridBorders, rows: [head, ...rows] });
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

export function lessonToDocument(lesson: Lesson, meta: DocMeta = {}) {
  const dots = (n: number) =>
    Array.from({ length: n }, () => para("……………………………………………………………………………………………………………………", { after: 60 }));

  return new Document({
    creator: "TeachMate",
    title: lesson.title,
    sections: [
      {
        properties: { page: { margin: { top: 1134, bottom: 1134, left: 1701, right: 1134 } } },
        children: [
          headerBlock(meta),
          para(" ", { after: 120 }),
          para("GIÁO ÁN TỔ CHỨC HOẠT ĐỘNG HỌC", { bold: true, size: 32, align: AlignmentType.CENTER, after: 60 }),
          para(`ĐỀ TÀI: ${lesson.title.toUpperCase()}`, { bold: true, align: AlignmentType.CENTER, after: 160 }),
          para(`Lĩnh vực: ${lesson.domain}`),
          para(`Chủ đề: ${lesson.theme}`),
          para(`Độ tuổi: ${lesson.ageGroup}`),
          para(`Thời gian: ${lesson.duration}`),
          ...(meta.teacher ? [para(`Người thực hiện: ${meta.teacher}`)] : []),
          ...(meta.date ? [para(`Ngày soạn: ${meta.date}`)] : []),

          heading("I. MỤC ĐÍCH - YÊU CẦU"),
          para("1. Kiến thức", { bold: true }),
          ...bullets(lesson.objectives.knowledge),
          para("2. Kỹ năng", { bold: true }),
          ...bullets(lesson.objectives.skills),
          para("3. Thái độ", { bold: true }),
          ...bullets(lesson.objectives.attitude),

          heading("II. CHUẨN BỊ"),
          para("1. Đồ dùng của cô giáo:", { bold: true }),
          ...bullets(lesson.preparation.teacher),
          para("2. Đồ dùng của trẻ:", { bold: true }),
          ...bullets(lesson.preparation.children),

          heading("III. TIẾN TRÌNH TỔ CHỨC HOẠT ĐỘNG"),
          procedureTable(lesson.procedure),

          heading("IV. HOẠT ĐỘNG MỞ RỘNG"),
          ...lines(lesson.extension),

          heading("V. ĐÁNH GIÁ VÀ RÚT KINH NGHIỆM SAU TIẾT DẠY"),
          ...dots(3),
          para(" ", { after: 120 }),
          signatureBlock(meta),
        ],
      },
    ],
  });
}

export async function lessonToBlob(lesson: Lesson, meta: DocMeta = {}) {
  return Packer.toBlob(lessonToDocument(lesson, meta));
}

export function lessonFileName(lesson: Lesson) {
  const base = lesson.title
    .normalize("NFC")
    .replace(/[\\/:*?"<>|]/g, "")
    .trim()
    .slice(0, 80);
  return `Giao an - ${base || "TeachMate"}.docx`;
}
