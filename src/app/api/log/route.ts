import { after, NextResponse } from "next/server";
import { z } from "zod";
import { clientId } from "@/lib/ratelimit";
import { EVENT_ACTIONS, logUsage } from "@/lib/usageLog";

const str = (n: number) => z.string().max(n).optional();
const bodySchema = z.object({
  action: z.enum(EVENT_ACTIONS),
  plan_type: z.enum(["lesson", "corner", "outdoor", "weekly"]),
  age_group: str(60),
  domain: str(80),
  theme: str(150),
  activity: str(200),
});

/** Client báo các hành động sau khi có giáo án (tải Word, sao chép, in). */
export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  const client = clientId(request);
  after(() => logUsage({ ...parsed.data, status: "success", client_id: client }));
  return new NextResponse(null, { status: 204 });
}
