import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import type { Lesson } from "@/lib/schemas/lesson";

const FONT = "Times New Roman";
const SIZE = 26; // 13pt

const run = (text: string, opts: { bold?: boolean; italics?: boolean; size?: number } = {}) =>
  new TextRun({ text, font: FONT, size: opts.size ?? SIZE, bold: opts.bold, italics: opts.italics });

const para = (text: string, opts: { bold?: boolean } = {}) =>
  new Paragraph({ children: [run(text, opts)], spacing: { after: 80 } });

const heading = (text: string) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [run(text, { bold: true })],
    spacing: { before: 200, after: 100 },
  });

const bullets = (items: string[]) =>
  items.map(
    (t) => new Paragraph({ children: [run(t)], bullet: { level: 0 }, spacing: { after: 40 } }),
  );

const cell = (text: string, bold = false) =>
  new TableCell({
    width: { size: 50, type: WidthType.PERCENTAGE },
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: text
      .split("\n")
      .filter(Boolean)
      .map((line) => new Paragraph({ children: [run(line, { bold })], spacing: { after: 40 } })),
  });

function procedureTable(steps: Lesson["procedure"]) {
  const border = { style: BorderStyle.SINGLE, size: 4, color: "000000" };
  const borders = { top: border, bottom: border, left: border, right: border };
  const rows = [
    new TableRow({ tableHeader: true, children: [cell("Hoạt động của cô", true), cell("Hoạt động của trẻ", true)] }),
  ];
  for (const s of steps) {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 2,
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
            shading: { fill: "F2F2F2" },
            children: [new Paragraph({ children: [run(s.step, { bold: true })] })],
          }),
        ],
      }),
      new TableRow({ children: [cell(s.teacherActions), cell(s.childrenActions)] }),
    );
  }
  return new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE }, borders: {
    ...borders, insideHorizontal: border, insideVertical: border,
  } });
}

export function lessonToDocument(lesson: Lesson) {
  return new Document({
    creator: "TeachMate",
    title: lesson.title,
    sections: [
      {
        properties: { page: { margin: { top: 1134, bottom: 1134, left: 1701, right: 1134 } } },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [run("GIÁO ÁN", { bold: true, size: 32 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 160 },
            children: [run(`Hoạt động: ${lesson.title}`, { bold: true })],
          }),
          para(`Lĩnh vực: ${lesson.domain}`),
          para(`Chủ đề: ${lesson.theme}`),
          para(`Độ tuổi: ${lesson.ageGroup}`),
          para(`Thời gian: ${lesson.duration}`),

          heading("I. Mục đích yêu cầu"),
          para("1. Kiến thức", { bold: true }),
          ...bullets(lesson.objectives.knowledge),
          para("2. Kỹ năng", { bold: true }),
          ...bullets(lesson.objectives.skills),
          para("3. Thái độ", { bold: true }),
          ...bullets(lesson.objectives.attitude),

          heading("II. Chuẩn bị"),
          para("1. Của cô", { bold: true }),
          ...bullets(lesson.preparation.teacher),
          para("2. Của trẻ", { bold: true }),
          ...bullets(lesson.preparation.children),

          heading("III. Tiến hành"),
          procedureTable(lesson.procedure),

          heading("IV. Mở rộng"),
          para(lesson.extension),
        ],
      },
    ],
  });
}

export async function lessonToBlob(lesson: Lesson) {
  return Packer.toBlob(lessonToDocument(lesson));
}

export function lessonFileName(lesson: Lesson) {
  const base = lesson.title
    .normalize("NFC")
    .replace(/[\/:*?"<>|]/g, "")
    .trim()
    .slice(0, 80);
  return `Giao an - ${base || "TeachMate"}.docx`;
}
