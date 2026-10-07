import { planTypeById } from "@/lib/curriculum";
import type {
  CornerPlan,
  DeepPartial,
  DocMeta,
  Lesson,
  OutdoorPlan,
  PlanType,
  WeeklyPlan,
} from "@/lib/schemas/lesson";
import type { PartialPlan } from "@/hooks/useLessonStream";
import { DEFAULT_TEMPLATE } from "@/lib/exportTemplate";

const DOTS = "……………………………";

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

/** AI đôi khi tự thêm "- " đầu dòng, bỏ đi để không bị hai dấu đầu dòng. */
const stripMark = (t?: string) => t?.replace(/^\s*[-•*]\s+/, "");

const Bullets = ({ items }: { items?: (string | undefined)[] }) =>
  items?.length ? (
    <ul className="mb-2 list-disc space-y-1 pl-6">
      {items.map((t, i) => (
        <li key={i}>{stripMark(t)}</li>
      ))}
    </ul>
  ) : null;

const H = ({ children }: { children: React.ReactNode }) => <h3 className="mt-5 mb-1.5 font-bold">{children}</h3>;
const Th = ({ children, w }: { children: React.ReactNode; w?: string }) => (
  <th className="border border-black p-2" style={{ width: w }}>
    {children}
  </th>
);
const Td = ({ children }: { children: React.ReactNode }) => <td className="border border-black p-2">{children}</td>;
const tableCls = "w-full table-fixed border-collapse border border-black text-[15px]";

type Steps = DeepPartial<Lesson>["procedure"];

function ObjectivesAndPrep({ p }: { p: DeepPartial<Lesson> }) {
  return (
    <>
      {p.objectives && (
        <>
          <H>I. MỤC ĐÍCH - YÊU CẦU</H>
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
          <H>II. CHUẨN BỊ</H>
          {p.preparation.teacher && <p className="font-bold">1. Đồ dùng của cô giáo:</p>}
          <Bullets items={p.preparation.teacher} />
          {p.preparation.children && <p className="font-bold">2. Đồ dùng của trẻ:</p>}
          <Bullets items={p.preparation.children} />
        </>
      )}
    </>
  );
}

function ProcedureTable({ steps }: { steps: Steps }) {
  if (!steps?.length) return null;
  return (
    <table className={tableCls}>
      <thead>
        <tr className="bg-stone-100">
          <Th w="18%">Các bước &amp; Thời gian</Th>
          <Th w="41%">Hoạt động của cô giáo</Th>
          <Th w="41%">Hoạt động của trẻ</Th>
        </tr>
      </thead>
      <tbody>
        {steps.map((s, i) => (
          <tr key={i} className="align-top">
            <Td>
              <p className="font-bold">
                {i + 1}. {s.step}
              </p>
              {s.time && <p className="italic">{s.time}</p>}
            </Td>
            <Td>
              <Lines text={s.teacherActions} />
            </Td>
            <Td>
              <Lines text={s.childrenActions} />
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const Evaluation = ({ title }: { title: string }) => (
  <>
    <H>{title}</H>
    {[0, 1, 2].map((i) => (
      <p key={i} className="overflow-hidden whitespace-nowrap text-stone-500">
        {"…".repeat(200)}
      </p>
    ))}
  </>
);

function Signature({ meta }: { meta: DocMeta }) {
  return (
    <div className="mt-8 grid grid-cols-2 gap-6 text-center">
      <div>
        <p className="font-bold">{meta.template?.approverTitle?.trim() || DEFAULT_TEMPLATE.approverTitle}</p>
        <p className="italic">(Tổ trưởng chuyên môn / Ban Giám Hiệu)</p>
      </div>
      <div>
        <p className="italic">{meta.date ? `Ngày ${meta.date}` : "Ngày ..... tháng ..... năm ....."}</p>
        <p className="font-bold">GIÁO VIÊN SOẠN BÀI</p>
        <p className="italic">(Ký và ghi rõ họ tên)</p>
        {meta.teacher && <p className="mt-10 font-bold">{meta.teacher}</p>}
      </div>
    </div>
  );
}

function LessonBody({ p }: { p: DeepPartial<Lesson> }) {
  return (
    <>
      <ObjectivesAndPrep p={p} />
      {!!p.procedure?.length && (
        <>
          <H>III. TIẾN TRÌNH TỔ CHỨC HOẠT ĐỘNG</H>
          <ProcedureTable steps={p.procedure} />
        </>
      )}
      {p.extension && (
        <>
          <H>IV. HOẠT ĐỘNG MỞ RỘNG</H>
          <Lines text={p.extension} />
          <Evaluation title="V. ĐÁNH GIÁ VÀ RÚT KINH NGHIỆM SAU TIẾT DẠY" />
        </>
      )}
    </>
  );
}

function CornerBody({ p }: { p: DeepPartial<CornerPlan> }) {
  return (
    <>
      <ObjectivesAndPrep p={p as DeepPartial<Lesson>} />
      {!!p.corners?.length && (
        <>
          <H>III. CÁC GÓC CHƠI</H>
          <table className={tableCls}>
            <thead>
              <tr className="bg-stone-100">
                <Th w="16%">Góc chơi</Th>
                <Th w="28%">Nội dung chơi</Th>
                <Th w="24%">Đồ dùng</Th>
                <Th w="32%">Cô hướng dẫn</Th>
              </tr>
            </thead>
            <tbody>
              {p.corners.map((c, i) => (
                <tr key={i} className="align-top">
                  <Td>
                    <span className="font-bold">{c.name}</span>
                  </Td>
                  <Td>
                    <Lines text={c.content} />
                  </Td>
                  <Td>
                    <Bullets items={c.materials} />
                  </Td>
                  <Td>
                    <Lines text={c.teacherGuide} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {!!p.procedure?.length && (
        <>
          <H>IV. TIẾN TRÌNH TỔ CHỨC HOẠT ĐỘNG</H>
          <ProcedureTable steps={p.procedure} />
        </>
      )}
      {p.extension && (
        <>
          <H>V. GỢI Ý MỞ RỘNG</H>
          <Lines text={p.extension} />
          <Evaluation title="VI. ĐÁNH GIÁ VÀ RÚT KINH NGHIỆM" />
        </>
      )}
    </>
  );
}

function OutdoorBody({ p }: { p: DeepPartial<OutdoorPlan> }) {
  return (
    <>
      <ObjectivesAndPrep p={p as DeepPartial<Lesson>} />
      {!!p.safety?.length && (
        <>
          <H>III. LƯU Ý AN TOÀN</H>
          <Bullets items={p.safety} />
        </>
      )}
      {!!p.procedure?.length && (
        <>
          <H>IV. TIẾN TRÌNH TỔ CHỨC HOẠT ĐỘNG</H>
          <ProcedureTable steps={p.procedure} />
        </>
      )}
      {p.extension && (
        <>
          <H>V. GỢI Ý MỞ RỘNG</H>
          <Lines text={p.extension} />
          <Evaluation title="VI. ĐÁNH GIÁ VÀ RÚT KINH NGHIỆM" />
        </>
      )}
    </>
  );
}

const WEEK_ROWS: [string, keyof WeeklyPlan["days"][number]][] = [
  ["Đón trẻ, trò chuyện", "welcome"],
  ["Thể dục sáng", "morningExercise"],
  ["Hoạt động học", "learning"],
  ["Hoạt động ngoài trời", "outdoor"],
  ["Hoạt động góc", "corners"],
  ["Hoạt động chiều", "afternoon"],
];

function WeeklyBody({ p }: { p: DeepPartial<WeeklyPlan> }) {
  return (
    <>
      {!!p.goals?.length && (
        <>
          <H>I. MỤC TIÊU THEO LĨNH VỰC</H>
          {p.goals.map((g, i) => (
            <div key={i}>
              {g.domain && <p className="font-bold">{g.domain}</p>}
              <Bullets items={g.content} />
            </div>
          ))}
        </>
      )}
      {!!p.preparation?.length && (
        <>
          <H>II. CHUẨN BỊ</H>
          <Bullets items={p.preparation} />
        </>
      )}
      {!!p.days?.length && (
        <>
          <H>III. HOẠT ĐỘNG TRONG TUẦN</H>
          <div className="overflow-x-auto">
            <table className={`${tableCls} min-w-[820px]`}>
              <thead>
                <tr className="bg-stone-100">
                  <Th w="14%">Hoạt động</Th>
                  {p.days.map((d, i) => (
                    <Th key={i}>{d.day}</Th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {WEEK_ROWS.map(([label, key]) => (
                  <tr key={key} className="align-top">
                    <Td>
                      <span className="font-bold">{label}</span>
                    </Td>
                    {p.days!.map((d, i) => (
                      <Td key={i}>
                        <Lines text={d[key]} />
                      </Td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {p.notes && (
        <>
          <H>IV. GHI CHÚ, PHỐI HỢP VỚI PHỤ HUYNH</H>
          <Lines text={p.notes} />
        </>
      )}
    </>
  );
}

/** Kế hoạch trình bày như văn bản hành chính (giống file Word xuất ra). */
export function DocumentPaper({ type, partial, meta }: { type: PlanType; partial: PartialPlan; meta: DocMeta }) {
  const p = partial as DeepPartial<Lesson & WeeklyPlan>;
  const info = planTypeById(type);
  const weekly = type === "weekly";

  return (
    <div className="overflow-x-auto bg-stone-100/70 p-3 sm:p-6 print:bg-white print:p-0">
      <div
        className={`mx-auto min-w-[640px] bg-white px-6 py-8 font-[family-name:Times_New_Roman,Times,serif] leading-relaxed text-black shadow-md ring-1 ring-black/5 sm:px-12 sm:py-12 print:shadow-none print:ring-0 ${
          weekly ? "max-w-[1180px]" : "max-w-[900px]"
        }`}
        style={{ fontSize: `${((meta.template?.fontSize ?? 13) / 13) * 16}px` }}
      >
        {/* Khổ giấy khi in / lưu PDF: kế hoạch tuần nằm ngang */}
        <style>{`@media print { @page { size: A4 ${weekly ? "landscape" : "portrait"}; margin: 15mm; } }`}</style>
        {meta.template?.logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={meta.template.logo.dataUrl} alt="" style={{ width: meta.template.logo.width, height: meta.template.logo.height }} className="mb-2" />
        )}
        {meta.template?.orgLine.trim() && <p className="mb-2 font-bold uppercase">{meta.template.orgLine.trim()}</p>}
        <div className="grid grid-cols-2 gap-4 font-bold">
          <div>
            <p>Trường: {meta.school || DOTS}</p>
            <p>Tổ: {meta.group || DOTS}</p>
          </div>
          <p>Họ và tên giáo viên: {meta.teacher || DOTS}</p>
        </div>

        <h2 className="mt-8 text-center text-2xl font-bold">{info?.doc}</h2>
        <p className="mt-1 text-center font-bold">
          {weekly ? "TÊN KẾ HOẠCH" : "TÊN BÀI DẠY"}: {p.title?.toUpperCase()}
        </p>
        <p className="text-center">
          {weekly ? "Lớp" : `Lĩnh vực/Hoạt động giáo dục: ${p.domain ?? "..."}; lớp`}: {meta.className || DOTS}
        </p>
        {!weekly && p.duration && <p className="text-center">Thời gian thực hiện: {p.duration}</p>}

        <div className="mt-4 mb-3">
          {p.theme && <p>Chủ đề: {p.theme}</p>}
          {weekly && p.branch && <p>Chủ đề nhánh: {p.branch}</p>}
          {p.ageGroup && <p>Độ tuổi: {p.ageGroup}</p>}
          {meta.date && <p>Ngày soạn: {meta.date}</p>}
        </div>

        {type === "lesson" && <LessonBody p={p as DeepPartial<Lesson>} />}
        {type === "corner" && <CornerBody p={partial as DeepPartial<CornerPlan>} />}
        {type === "outdoor" && <OutdoorBody p={partial as DeepPartial<OutdoorPlan>} />}
        {type === "weekly" && <WeeklyBody p={partial as DeepPartial<WeeklyPlan>} />}

        {(p.extension || p.notes) && meta.template?.showSignature !== false && <Signature meta={meta} />}
      </div>
    </div>
  );
}
