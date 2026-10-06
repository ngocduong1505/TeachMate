import { NextResponse } from "next/server";
import { generateStructuredStream } from "@/lib/gemini";
import { buildLessonPrompt } from "@/lib/prompts/lesson";
import { lessonSchema, requestSchema } from "@/lib/schemas/lesson";

export const maxDuration = 120;

/** Stream NDJSON: {"t":"chunk","d":"<json text>"} ... rồi {"t":"done"} hoặc {"t":"error","m":"..."} */
export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  let chunks: AsyncGenerator<string>;
  try {
    chunks = await generateStructuredStream(buildLessonPrompt(parsed.data), lessonSchema);
  } catch (e) {
    const status = (e as { status?: number })?.status;
    console.error("generate failed", e);
    return NextResponse.json(
      { error: status === 429 ? "Hệ thống đang quá tải, vui lòng thử lại sau ít phút." : "Không tạo được giáo án." },
      { status: status === 429 ? 429 : 500 },
    );
  }

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: object) => controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      try {
        let text = "";
        for await (const d of chunks) {
          text += d;
          send({ t: "chunk", d });
        }
        lessonSchema.parse(JSON.parse(text));
        send({ t: "done" });
      } catch (e) {
        console.error("stream failed", e);
        send({ t: "error", m: "Giáo án tạo ra không hợp lệ, vui lòng thử lại." });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
