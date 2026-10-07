"use client";

import { useEffect, useState } from "react";
import type { PlanType } from "@/lib/schemas/lesson";

const SUGGESTIONS: Record<PlanType, string[]> = {
  lesson: ["Thêm một trò chơi vận động", "Rút gọn cho vừa thời lượng", "Đơn giản hóa cho trẻ nhỏ hơn", "Thêm câu hỏi gợi mở", "Làm hoạt động sinh động hơn"],
  corner: ["Thêm một góc chơi", "Đổi sang chất liệu dễ kiếm, tái chế", "Thêm gợi ý hướng dẫn của cô", "Đơn giản hóa cho trẻ nhỏ hơn"],
  outdoor: ["Thêm một trò chơi vận động", "Phương án khi trời mưa", "Thêm lưu ý an toàn", "Làm hoạt động sinh động hơn"],
  weekly: ["Đổi hoạt động học ngày thứ Tư", "Thêm hoạt động vận động mỗi ngày", "Lồng ghép thêm bài hát, truyện, thơ", "Giảm bớt nội dung ngày thứ Sáu"],
};

type Props = {
  planType: PlanType;
  busy: boolean;
  error: string | null;
  canUndo: boolean;
  versions: number;
  onSubmit: (instruction: string) => void;
  onUndo: () => void;
};

/** Ô "Cô muốn chỉnh gì?": gửi yêu cầu để AI sửa bản đang xem. */
export function ReviseBox({ planType, busy, error, canUndo, versions, onSubmit, onUndo }: Props) {
  const [text, setText] = useState("");

  // Chỉnh thành công (có thêm một phiên bản) thì xóa nội dung đã gửi
  useEffect(() => setText(""), [versions]);

  const submit = () => {
    const v = text.trim();
    if (v && !busy) onSubmit(v);
  };

  return (
    <div className="no-print border-b border-amber-100 bg-white px-6 py-4 xl:px-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-display text-lg font-bold text-ink">💬 Cô muốn chỉnh gì không?</p>
        {canUndo && (
          <button
            type="button"
            onClick={onUndo}
            disabled={busy}
            className="rounded-full bg-white px-4 py-1.5 text-sm font-bold text-stone-700 ring-1 ring-amber-200 transition hover:bg-amber-50 disabled:opacity-50"
          >
            ↩ Hoàn tác ({versions - 1})
          </button>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {SUGGESTIONS[planType].map((s) => (
          <button
            key={s}
            type="button"
            disabled={busy}
            onClick={() => setText(s)}
            className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
        <textarea
          rows={2}
          maxLength={500}
          value={text}
          disabled={busy}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Mô tả điều cô muốn thay đổi, ví dụ: thêm trò chơi “Gieo hạt” ở phần cuối, rút phần ổn định còn 2 phút..."
          className="w-full flex-1 resize-none rounded-2xl border-2 border-amber-100 bg-white px-4 py-3 text-base text-ink shadow-sm outline-none transition placeholder:text-stone-400 focus:border-teal-400 focus:ring-4 focus:ring-teal-100 disabled:bg-stone-50"
        />
        <button
          type="button"
          onClick={submit}
          disabled={busy || !text.trim()}
          className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-teal-600 px-6 py-3 font-display text-lg font-bold text-white shadow-md shadow-teal-200 transition hover:-translate-y-0.5 hover:bg-teal-700 disabled:translate-y-0 disabled:opacity-50"
        >
          {busy ? (
            <>
              <span className="size-4 animate-spin rounded-full border-[3px] border-white/40 border-t-white" />
              Đang chỉnh...
            </>
          ) : (
            <>✨ Chỉnh sửa</>
          )}
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">
          {error} Bản đang xem vẫn được giữ nguyên.
        </p>
      )}
      <p className="mt-2 text-xs text-stone-500">Ctrl + Enter để gửi. AI sẽ chỉ sửa phần cô nói, giữ nguyên các phần còn lại.</p>
    </div>
  );
}
