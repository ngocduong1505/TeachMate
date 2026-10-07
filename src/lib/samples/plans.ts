import type { CornerPlan, Lesson, OutdoorPlan, Plan, PlanType, WeeklyPlan } from "@/lib/schemas/lesson";

/** Giáo án mẫu có sẵn: xem ngay, không cần gọi AI. Dùng để xem thử giao diện và thao tác nhanh. */

const lesson: Lesson = {
  title: "Mô tả ngày Tết quê em",
  ageGroup: "Mẫu giáo nhỡ (4–5 tuổi)",
  domain: "Phát triển nhận thức",
  theme: "Tết và mùa xuân",
  duration: "25 phút",
  objectives: {
    knowledge: [
      "Trẻ biết tên và một số đặc điểm nổi bật của ngày Tết Nguyên đán ở quê hương: hoa đào, hoa mai, bánh chưng, mâm ngũ quả.",
      "Trẻ hiểu Tết là dịp gia đình sum họp, chúc Tết nhau và mặc quần áo mới.",
    ],
    skills: [
      "Trẻ quan sát, ghi nhớ có chủ định và trả lời được các câu hỏi của cô rõ ràng, đủ câu.",
      "Trẻ phát triển ngôn ngữ mạch lạc khi mô tả lại cảnh ngày Tết bằng lời của mình.",
    ],
    attitude: ["Trẻ hào hứng tham gia hoạt động cùng cô và các bạn.", "Trẻ thêm yêu quê hương và háo hức đón Tết cổ truyền."],
  },
  preparation: {
    teacher: [
      "Tranh ảnh, slide trình chiếu về cảnh ngày Tết quê em (chợ hoa, gói bánh chưng, mâm ngũ quả, đi chúc Tết).",
      "Nhạc bài hát “Ngày Tết quê em”.",
      "Hệ thống câu hỏi gợi mở cho trẻ.",
    ],
    children: ["Trang phục gọn gàng, tâm thế thoải mái.", "Trẻ ngồi theo hình chữ U hoặc quây quần trên thảm."],
  },
  procedure: [
    {
      step: "Ổn định – gây hứng thú",
      time: "3 phút",
      teacherActions:
        "- Tổ chức cho trẻ hát và vận động theo bài hát “Ngày Tết quê em”.\n- Gợi mở bằng câu hỏi về nội dung bài hát và những việc mọi người làm khi Tết đến.\n- Khái quát và dẫn dắt trẻ vào nội dung: cô và trẻ cùng trò chuyện về ngày Tết quê em.",
      childrenActions: "- Hát và vận động cùng cô.\n- Trả lời câu hỏi theo hiểu biết của mình.\n- Chú ý lắng nghe cô dẫn dắt vào bài.",
    },
    {
      step: "Nội dung",
      time: "17 phút",
      teacherActions:
        "- Cho trẻ quan sát tranh, slide về chợ hoa ngày Tết; gợi mở bằng câu hỏi về cảnh vật, các loại hoa và màu sắc.\n- Khái quát: hoa đào, hoa mai báo hiệu mùa xuân về.\n- Giới thiệu tranh gói bánh chưng, mâm ngũ quả; đặt câu hỏi về các loại quả và món ăn quen thuộc của gia đình ngày Tết.\n- Mời 2–3 trẻ lên mô tả cảnh ngày Tết ở quê mình; quan sát, lắng nghe và chỉnh sửa ngôn ngữ cho trẻ.\n- Theo dõi, ghi nhận mức độ tham gia và khả năng mô tả của từng trẻ qua câu trả lời.\n- Động viên, khen ngợi trẻ.",
      childrenActions:
        "- Quan sát tranh và trả lời các câu hỏi của cô.\n- Chú ý lắng nghe cô khái quát.\n- Nêu tên các loại quả trên mâm ngũ quả và món ăn ngày Tết.\n- Lần lượt lên mô tả ngày Tết ở quê mình bằng câu hoàn chỉnh.\n- Lắng nghe bạn kể và cô nhận xét.",
    },
    {
      step: "Kết thúc",
      time: "5 phút",
      teacherActions:
        "- Nhận xét, tuyên dương sự tham gia tích cực của cả lớp.\n- Giáo dục trẻ ngoan ngoãn, vâng lời ông bà, bố mẹ trong dịp Tết.\n- Cho trẻ làm tiếng chim hót, gà gáy, di chuyển nhẹ nhàng sang hoạt động khác.",
      childrenActions: "- Lắng nghe cô nhận xét.\n- Ghi nhớ lời cô dặn dò.\n- Làm tiếng các con vật và chuyển hoạt động.",
    },
  ],
  extension: "Cho trẻ vẽ hoặc tô màu bức tranh về cảnh ngày Tết quê em trong giờ hoạt động góc.",
};

const corner: CornerPlan = {
  title: "Chơi ở các góc – chủ đề Gia đình thân yêu",
  ageGroup: "Mẫu giáo nhỡ (4–5 tuổi)",
  domain: "Tích hợp các lĩnh vực",
  theme: "Gia đình",
  duration: "40 phút",
  objectives: {
    knowledge: ["Trẻ biết công việc của các thành viên trong gia đình và đồ dùng quen thuộc trong nhà.", "Trẻ biết cách chơi ở từng góc theo thỏa thuận."],
    skills: ["Trẻ thể hiện được vai chơi, phối hợp cùng bạn trong nhóm chơi.", "Trẻ rèn sự khéo léo của đôi tay khi xếp, vẽ, nặn."],
    attitude: ["Trẻ yêu quý, kính trọng các thành viên trong gia đình.", "Trẻ biết cất đồ chơi gọn gàng sau khi chơi."],
  },
  preparation: {
    teacher: ["Bố trí các góc chơi thuận tiện, đủ ánh sáng, an toàn.", "Đồ chơi, nguyên vật liệu cho từng góc."],
    children: ["Trang phục gọn gàng.", "Một số nguyên liệu tái chế do trẻ mang từ nhà: hộp giấy, vỏ chai nhựa."],
  },
  corners: [
    {
      name: "Góc phân vai",
      content: "Trẻ đóng vai bố, mẹ, con, ông bà trong gia đình: nấu ăn, chăm em, đón khách.",
      materials: ["Bộ đồ chơi nấu ăn", "Búp bê, chăn gối", "Trang phục hóa trang đơn giản"],
      teacherGuide: "Gợi ý trẻ phân vai và thể hiện hành động, lời nói phù hợp; tham gia chơi cùng khi cần để mở rộng tình huống.",
    },
    {
      name: "Góc xây dựng",
      content: "Trẻ xây ngôi nhà của gia đình với sân, vườn, hàng rào.",
      materials: ["Khối gỗ, gạch nhựa", "Cây, hoa, hàng rào đồ chơi"],
      teacherGuide: "Gợi mở để trẻ bố trí các phòng; hướng dẫn trẻ phối hợp xếp chồng cân đối, vững chắc.",
    },
    {
      name: "Góc tạo hình",
      content: "Trẻ vẽ, nặn, xé dán bức tranh “Gia đình của bé”.",
      materials: ["Giấy, bút sáp màu", "Đất nặn", "Keo dán, giấy màu"],
      teacherGuide: "Quan sát, khuyến khích trẻ sáng tạo và nhận xét sản phẩm; hỗ trợ trẻ gặp khó khăn.",
    },
    {
      name: "Góc sách truyện",
      content: "Trẻ xem sách, kể chuyện theo tranh về gia đình.",
      materials: ["Sách truyện, tranh ảnh về gia đình", "Thảm, gối ngồi"],
      teacherGuide: "Khuyến khích trẻ kể lại câu chuyện theo tranh; lắng nghe và chỉnh sửa ngôn ngữ cho trẻ.",
    },
  ],
  procedure: [
    {
      step: "Thỏa thuận trước khi chơi",
      time: "5 phút",
      teacherActions: "- Tạo hứng thú bằng bài hát về gia đình.\n- Giới thiệu các góc chơi và gợi mở về nội dung chơi của từng góc.\n- Cùng trẻ thỏa thuận luật chơi, cho trẻ chọn góc và vai chơi.",
      childrenActions: "- Hát cùng cô.\n- Lắng nghe, nêu ý kiến về góc muốn chơi.\n- Nhận vai và về góc chơi.",
    },
    {
      step: "Quá trình chơi",
      time: "30 phút",
      teacherActions: "- Quan sát bao quát lớp, đến từng góc gợi mở, hướng dẫn để trẻ chơi liên kết giữa các góc.\n- Hỗ trợ trẻ gặp khó khăn; giải quyết xung đột giữa các trẻ.\n- Theo dõi, ghi nhận sự hứng thú và kỹ năng phối hợp của trẻ.",
      childrenActions: "- Thể hiện vai chơi, sử dụng đồ chơi, nguyên liệu theo nội dung góc.\n- Phối hợp, trao đổi với bạn trong nhóm.\n- Có thể chuyển góc khi cô gợi ý.",
    },
    {
      step: "Nhận xét sau khi chơi",
      time: "5 phút",
      teacherActions: "- Cho trẻ tham quan và giới thiệu sản phẩm ở các góc.\n- Nhận xét, khen ngợi nhóm chơi tốt; nhắc trẻ cất đồ chơi gọn gàng.",
      childrenActions: "- Giới thiệu sản phẩm, nói cảm nhận về buổi chơi.\n- Cất đồ chơi đúng nơi quy định.",
    },
  ],
  extension: "Những ngày sau thay đổi vai chơi (cửa hàng, bác sĩ), bổ sung nguyên liệu mới ở góc tạo hình để tăng hứng thú.",
};

const outdoor: OutdoorPlan = {
  title: "Quan sát cây bàng – trò chơi “Gieo hạt” – chơi tự do",
  ageGroup: "Mẫu giáo nhỡ (4–5 tuổi)",
  domain: "Phát triển nhận thức",
  theme: "Thực vật",
  duration: "30 phút",
  objectives: {
    knowledge: ["Trẻ gọi tên và nêu được đặc điểm của cây bàng: thân, cành, lá.", "Trẻ biết cây xanh cho bóng mát và làm không khí trong lành."],
    skills: ["Trẻ rèn kỹ năng quan sát, so sánh và diễn đạt bằng câu hoàn chỉnh.", "Trẻ rèn sự nhanh nhẹn khi chơi trò chơi vận động."],
    attitude: ["Trẻ yêu quý, biết chăm sóc và bảo vệ cây xanh."],
  },
  preparation: {
    teacher: ["Chọn địa điểm quan sát an toàn, có cây bàng.", "Mũ nón, nước uống, đồ chơi ngoài trời, vạch xuất phát."],
    children: ["Trang phục gọn gàng, đi giày dép phù hợp.", "Trẻ xếp hàng theo nhóm."],
  },
  safety: [
    "Kiểm tra sân chơi, loại bỏ vật sắc nhọn trước khi cho trẻ ra chơi.",
    "Che nắng, nhắc trẻ uống nước; không cho trẻ ra ngoài khi trời mưa hoặc quá nắng.",
    "Giáo viên quan sát bao quát, không để trẻ rời khỏi khu vực quy định.",
  ],
  procedure: [
    {
      step: "Ổn định – kiểm tra trang phục",
      time: "3 phút",
      teacherActions: "- Kiểm tra sức khỏe, trang phục của trẻ.\n- Nhắc nhở nội quy khi ra sân.",
      childrenActions: "- Xếp hàng, đi theo cô ra sân.\n- Lắng nghe nhắc nhở.",
    },
    {
      step: "Hoạt động có chủ đích: quan sát cây bàng",
      time: "10 phút",
      teacherActions: "- Dẫn trẻ đến gốc cây bàng, gợi mở bằng câu hỏi về tên, hình dáng, màu sắc của thân, cành, lá.\n- Cho trẻ sờ, ngửi lá rụng, so sánh với lá của cây khác.\n- Khái quát đặc điểm và ích lợi của cây bàng; giáo dục trẻ bảo vệ cây.",
      childrenActions: "- Quan sát, sờ, ngửi và trả lời câu hỏi của cô.\n- So sánh lá bàng với lá cây khác.\n- Lắng nghe cô khái quát.",
    },
    {
      step: "Trò chơi vận động “Gieo hạt”",
      time: "7 phút",
      teacherActions: "- Giới thiệu tên trò chơi, hướng dẫn luật chơi, cách chơi.\n- Tổ chức cho trẻ chơi 2–3 lần; quan sát, nhắc nhở trẻ chơi đúng luật.\n- Nhận xét, khen ngợi.",
      childrenActions: "- Lắng nghe luật chơi.\n- Tham gia chơi theo đội, phối hợp cùng bạn.",
    },
    {
      step: "Chơi tự do",
      time: "8 phút",
      teacherActions: "- Chuẩn bị đồ chơi ngoài trời (phấn, vòng, bóng); quan sát bao quát, đảm bảo an toàn.\n- Gợi ý trẻ chơi cùng nhau, nhường đồ chơi cho bạn.",
      childrenActions: "- Chọn đồ chơi và chơi theo ý thích.\n- Chơi đoàn kết, không tranh giành.",
    },
    {
      step: "Kết thúc – vệ sinh",
      time: "2 phút",
      teacherActions: "- Nhận xét ngắn gọn buổi hoạt động.\n- Hướng dẫn trẻ cất đồ chơi, xếp hàng vào lớp, rửa tay.",
      childrenActions: "- Cất đồ chơi, xếp hàng vào lớp.\n- Rửa tay sạch sẽ.",
    },
  ],
  extension: "Cho trẻ nhặt lá bàng rụng để làm tranh dán trong giờ hoạt động góc.",
};

const weekly: WeeklyPlan = {
  title: "Kế hoạch tuần – Con vật nuôi trong gia đình",
  ageGroup: "Mẫu giáo bé (3–4 tuổi)",
  theme: "Thế giới động vật",
  branch: "Con vật nuôi trong gia đình",
  goals: [
    { domain: "Phát triển thể chất", content: ["Trẻ thực hiện được bài tập bò, trườn, chạy theo hướng thẳng.", "Trẻ biết rửa tay trước khi ăn."] },
    { domain: "Phát triển nhận thức", content: ["Trẻ gọi tên, nêu đặc điểm nổi bật, ích lợi của 3–4 con vật nuôi.", "Trẻ phân biệt con vật có 2 chân, 4 chân."] },
    { domain: "Phát triển ngôn ngữ", content: ["Trẻ nghe hiểu và kể lại truyện đơn giản theo tranh.", "Trẻ đọc thuộc bài thơ ngắn về con vật."] },
    { domain: "Phát triển tình cảm và kỹ năng xã hội", content: ["Trẻ yêu quý, biết chăm sóc vật nuôi, không trêu chọc con vật."] },
    { domain: "Phát triển thẩm mỹ", content: ["Trẻ hát đúng giai điệu bài hát về con vật.", "Trẻ biết dùng các nét cơ bản để vẽ, nặn con vật."] },
  ],
  preparation: [
    "Tranh ảnh, mô hình, video về các con vật nuôi: gà, vịt, chó, mèo, lợn.",
    "Nguyên vật liệu tạo hình: đất nặn, giấy màu, bút sáp.",
    "Phối hợp phụ huynh cung cấp ảnh con vật nuôi của gia đình.",
  ],
  days: [
    {
      day: "Thứ Hai",
      welcome: "Đón trẻ, trò chuyện về con vật nuôi trong nhà bé.",
      morningExercise: "Tập các động tác theo nhạc bài “Con gà trống”.",
      learning: "Nhận thức: Làm quen con gà, con vịt.",
      outdoor: "Quan sát con gà trong khu vườn; chơi “Gà vào chuồng”.",
      corners: "Góc phân vai: bác nông dân; góc tạo hình: tô màu con gà.",
      afternoon: "Nghe truyện “Gà trống và vịt con”; vệ sinh, nêu gương cuối ngày.",
    },
    {
      day: "Thứ Ba",
      welcome: "Đón trẻ, cho trẻ xem tranh các con vật nuôi.",
      morningExercise: "Tập các động tác theo nhạc bài “Con gà trống”.",
      learning: "Thể chất: Bò theo hướng thẳng; trò chơi “Mèo và chim sẻ”.",
      outdoor: "Chơi với cát, nước; trò chơi “Bắt chước tiếng kêu”.",
      corners: "Góc xây dựng: chuồng trại cho các con vật; góc sách: xem tranh.",
      afternoon: "Làm quen bài thơ “Con mèo”; chơi tự chọn.",
    },
    {
      day: "Thứ Tư",
      welcome: "Đón trẻ, trò chuyện về tiếng kêu của các con vật.",
      morningExercise: "Tập các động tác theo nhạc bài “Con gà trống”.",
      learning: "Ngôn ngữ: Truyện “Đôi bạn tốt”.",
      outdoor: "Dạo chơi sân trường; trò chơi “Gieo hạt”.",
      corners: "Góc phân vai: bán hàng; góc nghệ thuật: hát “Gà trống, mèo con và cún con”.",
      afternoon: "Ôn bài thơ “Con mèo”; trò chuyện về cách chăm sóc vật nuôi.",
    },
    {
      day: "Thứ Năm",
      welcome: "Đón trẻ, cho trẻ chia sẻ ảnh con vật nuôi mang từ nhà.",
      morningExercise: "Tập các động tác theo nhạc bài “Con gà trống”.",
      learning: "Thẩm mỹ: Nặn thức ăn cho gà.",
      outdoor: "Quan sát con chó; trò chơi “Chó sói xấu tính”.",
      corners: "Góc tạo hình: xé dán lông gà; góc thiên nhiên: chăm sóc cây.",
      afternoon: "Xem video về vật nuôi; chơi tự chọn.",
    },
    {
      day: "Thứ Sáu",
      welcome: "Đón trẻ, trò chuyện về điều bé thích nhất trong tuần.",
      morningExercise: "Tập các động tác theo nhạc bài “Con gà trống”.",
      learning: "Nhạc: Hát “Gà trống, mèo con và cún con”; nghe hát “Chú voi con ở bản Đôn”.",
      outdoor: "Chơi tự do với đồ chơi ngoài trời; trò chơi “Mèo đuổi chuột”.",
      corners: "Cho trẻ chọn góc chơi yêu thích; trưng bày sản phẩm của tuần.",
      afternoon: "Vệ sinh, nêu gương bé ngoan cuối tuần; phát phiếu bé ngoan.",
    },
  ],
  notes:
    "Đề nghị phụ huynh gửi ảnh vật nuôi của gia đình để trẻ chia sẻ ở lớp. Lưu ý an toàn khi trẻ tiếp xúc với con vật thật: chỉ quan sát từ xa, rửa tay sau khi chơi. Cuối tuần đánh giá mức độ đạt mục tiêu của trẻ qua quan sát, sản phẩm và trò chuyện.",
};


export const SAMPLE_PLANS: Record<PlanType, Plan> = { lesson, corner, outdoor, weekly };
