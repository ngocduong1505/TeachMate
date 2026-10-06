"use client";

import { useCallback, useRef, useState } from "react";
import { Allow, parse } from "partial-json";
import { lessonSchema, type Lesson, type LessonRequest } from "@/lib/schemas/lesson";

export type PartialLesson = {
  [K in keyof Lesson]?: Lesson[K] extends (infer U)[]
    ? Partial<U>[]
    : Lesson[K] extends object
      ? { [P in keyof Lesson[K]]?: Lesson[K][P] }
      : Lesson[K];
};

type StreamEvent =
  | { t: "meta"; cached?: boolean }
  | { t: "chunk"; d: string }
  | { t: "done" }
  | { t: "error"; m?: string };

/** Gọi /api/generate và đọc luồng NDJSON, cập nhật giáo án dần dần. */
export function useLessonStream() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [partial, setPartial] = useState<PartialLesson | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null); // chỉ có khi stream hoàn tất và hợp lệ
  const [cached, setCached] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const lastInput = useRef<LessonRequest | null>(null);

  const run = useCallback(async (input: LessonRequest, fresh = false) => {
    lastInput.current = input;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError(null);
    setLesson(null);
    setPartial(null);
    setCached(false);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, fresh }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Có lỗi xảy ra");
      }

      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = "";
      let json = "";
      let finished = false;
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const ev = JSON.parse(line) as StreamEvent;
          if (ev.t === "meta") {
            setCached(!!ev.cached);
          } else if (ev.t === "chunk") {
            json += ev.d;
            try {
              setPartial(parse(json, Allow.ALL) as PartialLesson);
            } catch {
              /* chunk cắt giữa token, đợi chunk sau */
            }
          } else if (ev.t === "error") {
            throw new Error(ev.m ?? "Có lỗi xảy ra");
          } else if (ev.t === "done") {
            const result = lessonSchema.safeParse(JSON.parse(json));
            if (!result.success) throw new Error("Giáo án tạo ra không hợp lệ, vui lòng thử lại.");
            setLesson(result.data);
            setPartial(result.data);
            finished = true;
          }
        }
      }
      if (!finished) throw new Error("Kết nối bị gián đoạn, vui lòng thử lại.");
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      if (abortRef.current === ctrl) setLoading(false);
    }
  }, []);

  const regenerate = useCallback(() => {
    if (lastInput.current) void run(lastInput.current, true);
  }, [run]);

  return { run, regenerate, loading, error, partial, lesson, cached };
}
