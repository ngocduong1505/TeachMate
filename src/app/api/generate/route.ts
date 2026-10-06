import { NextResponse } from "next/server";
import { cacheKey, getCachedLesson, setCachedLesson } from "@/lib/cache";
import { generateStructuredStream } from "@/lib/gemini";
import { buildLessonPrompt } from "@/lib/prompts/lesson";
import { checkRateLimit, clientId } from "@/lib/ratelimit";
import { lessonSchema, requestSchema } from "@/lib/schemas/lesson";

export const maxDuration = 120;

const encoder = new TextEncoder();
const line = (obj: object) => encoder.encode(JSON.stringify(obj) + "\n");
const ndjson = (body: ReadableStream<Uint8Array>) =>
  new Response(body, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });

/**
 * Stream NDJSON:
 *   {"t":"meta","cached":bool} -> {"t":"chunk","d":"<json text>"}... -> {"t":"done"} | {"t":"error","m":"..."}
 * Yêu cầu trùng với kết quả đã cache thì trả ngay, không tốn quota Gemini và không tính rate limit.
 */
export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }
  const input = parsed.data;
  const key = cacheKey(input);

  if (!input.fresh) {
    const cached = await getCachedLesson(key);
    if (cached) {
      const json = JSON.stringify(cached);
      return ndjson(
        new ReadableStream({
          start(controller) {
            controller.enqueue(line({ t: "meta", cached: true }));
            for (let i = 0; i < json.length; i += 400) {
              controller.enqueue(line({ t: "chunk", d: json.slice(i, i + 400) }));
            }
            controller.enqueue(line({ t: "done" }));
            controller.close();
          },
        }),
      );
    }
  }

  const limit = await checkRateLimit(clientId(request));
  if (!limit.ok) {
    const message =
      limit.scope === "global"
        ? "Hệ thống đã hết lượt tạo giáo án hôm nay, vui lòng quay lại sau."
        : `Bạn tạo giáo án hơi nhanh, vui lòng thử lại sau ${formatWait(limit.retryAfter)}.`;
    return NextResponse.json(
      { error: message },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let chunks: AsyncGenerator<string>;
  try {
    chunks = await generateStructuredStream(buildLessonPrompt(input), lessonSchema);
  } catch (e) {
    const status = (e as { status?: number })?.status;
    console.error("generate failed", e);
    return NextResponse.json(
      { error: status === 429 ? "Hệ thống đang quá tải, vui lòng thử lại sau ít phút." : "Không tạo được giáo án." },
      { status: status === 429 ? 429 : 500 },
    );
  }

  return ndjson(
    new ReadableStream({
      async start(controller) {
        controller.enqueue(line({ t: "meta", cached: false }));
        try {
          let text = "";
          for await (const d of chunks) {
            text += d;
            controller.enqueue(line({ t: "chunk", d }));
          }
          const lesson = lessonSchema.parse(JSON.parse(text));
          await setCachedLesson(key, lesson);
          controller.enqueue(line({ t: "done" }));
        } catch (e) {
          console.error("stream failed", e);
          const invalid = e instanceof SyntaxError || (e as { name?: string })?.name === "ZodError";
          controller.enqueue(
            line({
              t: "error",
              m: invalid
                ? "Giáo án tạo ra không hợp lệ, vui lòng thử lại."
                : "Kết nối tới AI bị gián đoạn giữa chừng, vui lòng thử lại.",
            }),
          );
        } finally {
          controller.close();
        }
      },
    }),
  );
}

function formatWait(seconds: number) {
  if (seconds < 90) return `${seconds} giây`;
  if (seconds < 5400) return `${Math.ceil(seconds / 60)} phút`;
  return `${Math.ceil(seconds / 3600)} giờ`;
}
