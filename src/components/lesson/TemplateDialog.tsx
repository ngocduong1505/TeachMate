"use client";

import { useRef } from "react";
import { logoFromFile, type ExportTemplate } from "@/lib/exportTemplate";

type Props = { template: ExportTemplate; onChange: (patch: Partial<ExportTemplate>) => void; onClose: () => void };

/** Cửa sổ chỉnh mẫu xuất file Word / in theo yêu cầu của trường. */
export function TemplateDialog({ template: t, onChange, onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const input = "w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500";

  return (
    <div className="no-print fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-label="Mẫu xuất file"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md space-y-4 rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold">⚙ Mẫu xuất file</h2>
          <button onClick={onClose} className="text-2xl leading-none text-stone-400 hover:text-stone-700" aria-label="Đóng">
            ×
          </button>
        </div>
        <p className="text-xs text-stone-500">Áp dụng cho file Word và bản in/PDF. Được lưu trên máy này cho các lần sau.</p>

        <label className="block text-sm font-semibold">
          Cơ quan chủ quản (in đầu trang)
          <input
            value={t.orgLine}
            maxLength={80}
            onChange={(e) => onChange({ orgLine: e.target.value })}
            placeholder="Ví dụ: PHÒNG GD&ĐT QUẬN 1"
            className={`${input} mt-1`}
          />
        </label>

        <div className="text-sm font-semibold">
          Logo trường
          <div className="mt-1 flex items-center gap-3">
            {t.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.logo.dataUrl} alt="Logo" style={{ width: t.logo.width, height: t.logo.height }} className="rounded border border-amber-100" />
            ) : (
              <span className="text-xs font-normal text-stone-400">Chưa có logo</span>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={async (e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (!f) return;
                const logo = await logoFromFile(f).catch(() => null);
                if (logo) onChange({ logo });
                else alert("Không đọc được ảnh. Cô chọn ảnh PNG hoặc JPG dưới 5MB nhé.");
              }}
            />
            <button type="button" onClick={() => fileRef.current?.click()} className="rounded-full bg-white px-3 py-1 text-xs font-bold ring-1 ring-amber-200 hover:bg-amber-50">
              {t.logo ? "Đổi" : "Tải lên"}
            </button>
            {t.logo && (
              <button type="button" onClick={() => onChange({ logo: null })} className="text-xs font-semibold text-rose-600 hover:underline">
                Xóa
              </button>
            )}
          </div>
        </div>

        <label className="block text-sm font-semibold">
          Cỡ chữ nội dung
          <select
            value={t.fontSize}
            onChange={(e) => onChange({ fontSize: Number(e.target.value) as ExportTemplate["fontSize"] })}
            className={`${input} mt-1`}
          >
            {[12, 13, 14].map((s) => (
              <option key={s} value={s}>
                {s} pt{s === 13 ? " (mặc định)" : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={t.showSignature} onChange={(e) => onChange({ showSignature: e.target.checked })} />
          Hiện phần ký duyệt cuối giáo án
        </label>
        {t.showSignature && (
          <label className="block text-sm font-semibold">
            Tiêu đề ô ký bên trái
            <input value={t.approverTitle} maxLength={60} onChange={(e) => onChange({ approverTitle: e.target.value })} className={`${input} mt-1`} />
          </label>
        )}

        <button onClick={onClose} className="w-full rounded-full bg-teal-600 py-2 font-bold text-white hover:bg-teal-700">
          Xong
        </button>
      </div>
    </div>
  );
}
