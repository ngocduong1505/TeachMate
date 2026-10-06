import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const ai = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isRetryable(e: unknown) {
  const s = (e as { status?: number })?.status;
  return s === 429 || s === 503;
}

/** Sinh JSON theo schema; retry khi 429/503 rồi chuyển sang model dự phòng. */
export async function generateStructured<T extends z.ZodType>(
  prompt: string,
  schema: T,
): Promise<z.infer<T>> {
  if (!process.env.GEMINI_API_KEY) throw new Error("Thiếu GEMINI_API_KEY");
  const models = [
    process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
    process.env.GEMINI_FALLBACK_MODEL ?? "gemini-2.5-flash-lite",
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
    process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
    process.env.GEMINI_FALLBACK_MODEL ?? "gemini-2.5-flash-lite",
  ];
  let lastError: unknown;
  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const stream = await ai().models.generateContentStream({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseJsonSchema: z.toJSONSchema(schema),
          },
        });
        const it = stream[Symbol.asyncIterator]();
        let first = await it.next();
        while (!first.done && !first.value.text) first = await it.next();
        return (async function* () {
          if (first.done) return;
          yield first.value.text!;
          for (let n = await it.next(); !n.done; n = await it.next()) {
            if (n.value.text) yield n.value.text;
          }
        })();
      } catch (e) {
        lastError = e;
        if (!isRetryable(e)) throw e;
        await sleep(1500 * (attempt + 1));
      }
    }
  }
  throw lastError;
}
