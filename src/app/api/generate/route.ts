import { NextResponse } from "next/server";
import { generateStructured } from "@/lib/gemini";
import { buildLessonPrompt } from "@/lib/prompts/lesson";
import { lessonSchema, requestSchema } from "@/lib/schemas/lesson";

export const maxDuration = 120;

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }
  try {
    const lesson = await generateStructured(buildLessonPrompt(parsed.data), lessonSchema);
    return NextResponse.json({ lesson });
  } catch (e) {
    const status = (e as { status?: number })?.status;
    console.error("generate failed", e);
    return NextResponse.json(
      { error: status === 429 ? "Hệ thống đang quá tải, vui lòng thử lại sau ít phút." : "Không tạo được giáo án." },
      { status: status === 429 ? 429 : 500 },
    );
  }
}
