"use client";

import { useCallback, useRef, useState } from "react";
import { Allow, parse } from "partial-json";
import { schemaByType, type DeepPartial, type LessonRequest, type Plan, type PlanType } from "@/lib/schemas/lesson";

export type PartialPlan = DeepPartial<Plan>;

type StreamEvent =
  | { t: "meta"; cached?: boolean }
  | { t: "chunk"; d: string }
  | { t: "done" }
  | { t: "error"; m?: string };

const MAX_HISTORY = 10;

/** Gọi /api/generate và đọc luồng NDJSON, cập nhật giáo án dần dần. Hỗ trợ chỉnh sửa bản đã có và hoàn tác. */
export function useLessonStream() {
  const [loading, setLoading] = useState(false);
  const [revising, setRevising] = useState(false);
  const [error, setError] = useState<string | null>(null); // lỗi khi soạn mới
  const [reviseError, setReviseError] = useState<string | null>(null); // lỗi khi chỉnh sửa (giữ nguyên bản đang xem)
  const [partial, setPartial] = useState<PartialPlan | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null); // chỉ có khi stream hoàn tất và hợp lệ
  const [history, setHistory] = useState<Plan[]>([]); // các bản trước đó, mới nhất ở cuối
  const [planType, setPlanType] = useState<PlanType>("lesson");
  const [cached, setCached] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const lastInput = useRef<LessonRequest | null>(null);
  const planRef = useRef<Plan | null>(null); // bản hiện tại, dùng trong callback
  planRef.current = plan;

  const execute = useCallback(async (input: LessonRequest, fresh: boolean, instruction?: string) => {
    const current = planRef.current;
    const isRevise = !!instruction && !!current;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setReviseError(null);
    setError(null);
    if (isRevise) {
      setRevising(true); // giữ nguyên bản đang xem cho tới khi có chữ mới
    } else {
      lastInput.current = input;
      setPlanType(input.type);
      setPlan(null);
      setPartial(null);
      setHistory([]);
      setCached(false);
    }
    try {
      const body = isRevise
        ? { ...input, fresh: true, revise: { plan: current, instruction } }
        : { ...input, fresh };
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
              setPartial(parse(json, Allow.ALL) as PartialPlan);
            } catch {
              /* chunk cắt giữa token, đợi chunk sau */
            }
          } else if (ev.t === "error") {
            throw new Error(ev.m ?? "Có lỗi xảy ra");
          } else if (ev.t === "done") {
            const result = schemaByType[input.type].safeParse(JSON.parse(json));
            if (!result.success) throw new Error("Giáo án tạo ra không hợp lệ, vui lòng thử lại.");
            if (isRevise && current) setHistory((h) => [...h, current].slice(-MAX_HISTORY));
            setPlan(result.data as Plan);
            setPartial(result.data as PartialPlan);
            finished = true;
          }
        }
      }
      if (!finished) throw new Error("Kết nối bị gián đoạn, vui lòng thử lại.");
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      const message = err instanceof Error ? err.message : "Có lỗi xảy ra";
      if (isRevise) {
        // Chỉnh sửa lỗi: quay về bản đang có, báo lỗi ngay tại ô chỉnh sửa
        setPartial(current as PartialPlan);
        setReviseError(message);
      } else {
        setError(message);
      }
    } finally {
      if (abortRef.current === ctrl) {
        setLoading(false);
        setRevising(false);
      }
    }
  }, []);

  const run = useCallback((input: LessonRequest, fresh = false) => execute(input, fresh), [execute]);

  const regenerate = useCallback(() => {
    if (lastInput.current) void execute(lastInput.current, true);
  }, [execute]);

  /** Chỉnh bản đang xem theo yêu cầu của cô. */
  const revise = useCallback(
    (instruction: string) => {
      if (lastInput.current && planRef.current) void execute(lastInput.current, true, instruction);
    },
    [execute],
  );

  /** Quay lại bản trước đó. */
  const undo = useCallback(() => {
    setHistory((h) => {
      const prev = h[h.length - 1];
      if (!prev) return h;
      setPlan(prev);
      setPartial(prev as PartialPlan);
      setReviseError(null);
      return h.slice(0, -1);
    });
  }, []);

  return {
    run,
    regenerate,
    revise,
    undo,
    canUndo: history.length > 0,
    versions: history.length + 1,
    loading,
    revising,
    error,
    reviseError,
    partial,
    plan,
    planType,
    cached,
  };
}
