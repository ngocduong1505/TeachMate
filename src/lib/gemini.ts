import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const ai = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isRetryable(e: unknown) {
  const s = (e as { status?: number })?.status;
  return s === 429 || s === 503 || s === 404; // 404: model đã bị ngừng, thử model kế tiếp
}

/** Sinh JSON theo schema; retry khi 429/503 rồi chuyển sang model dự phòng. */
export async function generateStructured<T extends z.ZodType>(
  prompt: string,
  schema: T,
): Promise<z.infer<T>> {
  if (!process.env.GEMINI_API_KEY) throw new Error("Thiếu GEMINI_API_KEY");
  const models = [
    process.env.GEMINI_MODEL ?? "gemini-flash-latest",
    process.env.GEMINI_FALLBACK_MODEL ?? "gemini-flash-lite-latest",
  ];
  let lastError: unknown;
  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await ai().models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseJsonSchema: z.toJSONSchema(schema),
          },
        });
        return schema.parse(JSON.parse(res.text ?? ""));
      } catch (e) {
        lastError = e;
        if (!isRetryable(e)) throw e;
        await sleep(1500 * (attempt + 1));
      }
    }
  }
  throw lastError;
}

/**
 * Stream JSON text theo schema. Chỉ retry/fallback khi lỗi xảy ra trước chunk đầu tiên
 * (sau đó client đã nhận dữ liệu nên không thể chạy lại một cách trong suốt).
 * Chunk đầu tiên được đọc trước khi trả về, nên lỗi khởi tạo (429...) ném ra ngay tại đây.
 */
export async function generateStructuredStream(
  prompt: string,
  schema: z.ZodType,
): Promise<AsyncGenerator<string>> {
  if (!process.env.GEMINI_API_KEY) throw new Error("Thiếu GEMINI_API_KEY");
  const models = [
    process.env.GEMINI_MODEL ?? "gemini-flash-latest",
    process.env.GEMINI_FALLBACK_MODEL ?? "gemini-flash-lite-latest",
  ];
  const firstChunkMs = Number(process.env.GEMINI_FIRST_CHUNK_MS ?? 25000);
  let lastError: unknown;
  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      // Model quá tải có thể treo rất lâu trước khi trả chữ đầu tiên: quá hạn thì bỏ, chuyển model kế tiếp.
      const ctrl = new AbortController();
      let timedOut = false;
      const timer = setTimeout(() => {
        timedOut = true;
        ctrl.abort();
      }, firstChunkMs);
      try {
        const stream = await ai().models.generateContentStream({
          model,
          contents: prompt,
          config: {
            abortSignal: ctrl.signal,
            responseMimeType: "application/json",
            responseJsonSchema: z.toJSONSchema(schema),
          },
        });
        const it = stream[Symbol.asyncIterator]();
        let first = await it.next();
        while (!first.done && !first.value.text) first = await it.next();
        clearTimeout(timer);
        return (async function* () {
          if (first.done) return;
          yield first.value.text!;
          for (let n = await it.next(); !n.done; n = await it.next()) {
            if (n.value.text) yield n.value.text;
          }
        })();
      } catch (e) {
        clearTimeout(timer);
        const status = (e as { status?: number })?.status;
        if (timedOut) {
          lastError = Object.assign(new Error(`Model ${model} không phản hồi kịp`), { status: 503 });
          break; // sang model kế tiếp ngay
        }
        lastError = e;
        if (!isRetryable(e)) throw e;
        if (status === 404) break; // model đã bị ngừng, thử retry cũng vô ích
        await sleep(1000 * (attempt + 1));
      }
    }
  }
  throw lastError;
}
