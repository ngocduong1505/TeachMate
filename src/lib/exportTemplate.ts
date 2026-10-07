/** Mẫu xuất file theo yêu cầu của từng trường. Lưu trong trình duyệt của cô. */
export type ExportTemplate = {
  orgLine: string; // dòng cơ quan chủ quản, ví dụ "PHÒNG GD&ĐT QUẬN 1"
  logo: { dataUrl: string; width: number; height: number } | null;
  fontSize: 12 | 13 | 14; // cỡ chữ nội dung (pt)
  showSignature: boolean;
  approverTitle: string; // tiêu đề ô ký bên trái
};

export const DEFAULT_TEMPLATE: ExportTemplate = {
  orgLine: "",
  logo: null,
  fontSize: 13,
  showSignature: true,
  approverTitle: "NGƯỜI DUYỆT GIÁO ÁN",
};

const KEY = "teachmate.exportTemplate";

export function readTemplate(): ExportTemplate {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "null");
    return raw ? { ...DEFAULT_TEMPLATE, ...raw } : DEFAULT_TEMPLATE;
  } catch {
    return DEFAULT_TEMPLATE;
  }
}

export function writeTemplate(t: ExportTemplate) {
  try {
    localStorage.setItem(KEY, JSON.stringify(t));
  } catch {
    /* bộ nhớ đầy hoặc bị chặn: bỏ qua, mẫu vẫn dùng được trong phiên này */
  }
}

/** Thu nhỏ ảnh logo (cao tối đa 90px) và đổi sang PNG để file Word nhẹ. */
export async function logoFromFile(file: File): Promise<ExportTemplate["logo"]> {
  if (!file.type.startsWith("image/") || file.size > 5_000_000) return null;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 90 / bitmap.height, 240 / bitmap.width);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width * 2; // gấp đôi cho nét khi in
  canvas.height = height * 2;
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return { dataUrl: canvas.toDataURL("image/png"), width, height };
}
