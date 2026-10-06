import type { PartialLesson } from "@/hooks/useLessonStream";
import type { DocMeta } from "@/lib/schemas/lesson";

const Lines = ({ text }: { text?: string }) => (
  <>
    {text
      ?.split("\n")
      .filter((l) => l.trim())
      .map((l, i) => (
        <p key={i} className="mb-1.5">
          {l}
        </p>
      ))}
  </>
);

const Bullets = ({ items }: { items?: (string | undefined)[] }) =>
  items?.length ? (
    <ul className="mb-2 list-disc space-y-1 pl-6">
      {items.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  ) : null;

/** Giáo án trình bày như văn bản hành chính (giống file Word xuất ra). */
export function DocumentPaper({ partial: p, meta }: { partial: PartialLesson; meta: DocMeta }) {
  return (
    <div className="overflow-x-auto bg-stone-100/70 p-3 sm:p-6 print:bg-white print:p-0">
      <div className="mx-auto min-w-[640px] max-w-[900px] bg-white px-6 py-8 font-[family-name:Times_New_Roman,Times,serif] text-[16px] leading-relaxed text-black shadow-md ring-1 ring-black/5 sm:px-12 sm:py-12 print:shadow-none print:ring-0">
        <div className="grid grid-cols-[1fr_1.2fr] gap-6 text-[15px] font-bold">
          <div>
            <p>ĐƠN VỊ: {meta.school ? meta.school.toUpperCase() : "……………………………"}</p>
            <p>LỚP: {meta.className || "……………………………"}</p>
          </div>
          <div className="text-center">
            <p>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
            <p className="inline-block border-b border-black pb-0.5">Độc lập - Tự do - Hạnh phúc</p>
          </div>
        </div>

        <h2 className="mt-8 text-center text-2xl font-bold">GIÁO ÁN TỔ CHỨC HOẠT ĐỘNG HỌC</h2>
        <p className="mt-1 mb-5 text-center font-bold">ĐỀ TÀI: {p.title?.toUpperCase()}</p>

        <div className="mb-3">
          {p.domain && <p>Lĩnh vực: {p.domain}</p>}
          {p.theme && <p>Chủ đề: {p.theme}</p>}
          {p.ageGroup && <p>Độ tuổi: {p.ageGroup}</p>}
          {p.duration && <p>Thời gian: {p.duration}</p>}
          {meta.teacher && <p>Người thực hiện: {meta.teacher}</p>}
          {meta.date && <p>Ngày soạn: {meta.date}</p>}
        </div>

        {p.objectives && (
          <>
            <h3 className="mt-5 mb-1 font-bold">I. MỤC ĐÍCH - YÊU CẦU</h3>
            {p.objectives.knowledge && <p className="font-bold">1. Kiến thức</p>}
            <Bullets items={p.objectives.knowledge} />
            {p.objectives.skills && <p className="font-bold">2. Kỹ năng</p>}
            <Bullets items={p.objectives.skills} />
            {p.objectives.attitude && <p className="font-bold">3. Thái độ</p>}
            <Bullets items={p.objectives.attitude} />
          </>
        )}

        {p.preparation && (
          <>
            <h3 className="mt-5 mb-1 font-bold">II. CHUẨN BỊ</h3>
            {p.preparation.teacher && <p className="font-bold">1. Đồ dùng của cô giáo:</p>}
            <Bullets items={p.preparation.teacher} />
            {p.preparation.children && <p className="font-bold">2. Đồ dùng của trẻ:</p>}
            <Bullets items={p.preparation.children} />
          </>
        )}

        {!!p.procedure?.length && (
          <>
            <h3 className="mt-5 mb-2 font-bold">III. TIẾN TRÌNH TỔ CHỨC HOẠT ĐỘNG</h3>
            <table className="w-full table-fixed border-collapse border border-black text-[15px]">
              <thead>
                <tr className="bg-stone-100">
                  <th className="w-[18%] border border-black p-2">Các bước &amp; Thời gian</th>
                  <th className="w-[41%] border border-black p-2">Hoạt động của cô giáo</th>
                  <th className="w-[41%] border border-black p-2">Hoạt động của trẻ</th>
                </tr>
              </thead>
              <tbody>
                {p.procedure.map((s, i) => (
                  <tr key={i} className="align-top">
                    <td className="border border-black p-2">
                      <p className="font-bold">
                        {i + 1}. {s.step}
                      </p>
                      {s.time && <p className="italic">{s.time}</p>}
                    </td>
                    <td className="border border-black p-2">
                      <Lines text={s.teacherActions} />
                    </td>
                    <td className="border border-black p-2">
                      <Lines text={s.childrenActions} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {p.extension && (
          <>
            <h3 className="mt-5 mb-1 font-bold">IV. HOẠT ĐỘNG MỞ RỘNG</h3>
            <Lines text={p.extension} />
            <h3 className="mt-5 mb-1 font-bold">V. ĐÁNH GIÁ VÀ RÚT KINH NGHIỆM SAU TIẾT DẠY</h3>
            {[0, 1, 2].map((i) => (
              <p key={i} className="overflow-hidden whitespace-nowrap text-stone-500">
                {"…".repeat(200)}
              </p>
            ))}
            <div className="mt-8 grid grid-cols-2 gap-6 text-center">
              <div>
                <p className="font-bold">NGƯỜI DUYỆT GIÁO ÁN</p>
                <p className="italic">(Tổ trưởng chuyên môn / Ban Giám Hiệu)</p>
              </div>
              <div>
                <p className="italic">{meta.date ? `Ngày ${meta.date}` : "Ngày ..... tháng ..... năm ....."}</p>
                <p className="font-bold">GIÁO VIÊN SOẠN BÀI</p>
                <p className="italic">(Ký và ghi rõ họ tên)</p>
                {meta.teacher && <p className="mt-10 font-bold">{meta.teacher}</p>}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
