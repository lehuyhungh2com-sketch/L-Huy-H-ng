import {
  Criteria,
  ClassItem,
  Campus,
  SchoolSettings,
  ScoreLog,
  EvaluationConfig,
} from '../types';

export const DEFAULT_EVALUATION_CONFIG: EvaluationConfig = {
  advancedClassesRatio: 0.7, // Lớp tiên tiến trở lên = 70%/tổng số lớp toàn trường
  excellentClassesRatio: 0.35, // Lớp xuất sắc: 35%/70% tổng số lớp
  goodClassesRatio: 0.35, // Lớp tiên tiến: 35%/70% tổng số lớp
  allowMainCampusExceed70: true, // Riêng trường chính xem xét CLB và HSG tỉnh để vượt 70%
  mainWeakBaseThreshold: 2, // 2 con điểm yếu bắt đầu trừ
  mainWeakBasePoints: 1, // Trừ 1đ cơ sở
  mainWeakStepPoints: 0.5, // Thêm 1 con điểm yếu trừ thêm 0.5đ
  subWeakThreshold: 5, // Các phân hiệu: 5 con điểm yếu trở lên
  subWeakPenalty: 2, // Trừ 2đ
  subWeakMaxCap: 2, // Trừ không quá 2đ
  mainA1GoodThreshold: 13, // Trường chính lớp A1 đạt 13 điểm tốt
  mainA2A3GoodThreshold: 10, // Trường chính lớp A2, A3 đạt 10 con điểm tốt
  subGoodThreshold: 5, // Các phân hiệu đạt 5 con điểm tốt
  goodScoreBonus: 2, // Cộng 2đ
  goodScoreMaxCap: 2, // Cộng không quá 2đ
  dormitoryMaxCap: 3, // Vi phạm bán trú trừ không quá 3 điểm
  ceremonyMaxCap: 0.5, // Đội nghi lễ tối đa không quá 0.5đ/lớp
  lostFoundValueThreshold: 200000, // Giá trị từ 200.000đ trở đi
};

// Full criteria database extracted directly from "Tiêu chí xếp loại lớp 2026 - 2027.pdf"
export const OFFICIAL_CRITERIA_DATABASE: Criteria[] = [
  // 1. Chuyên cần (Nghỉ học có phép không trừ điểm)
  {
    id: 'crit_cc_01',
    code: 'CC01',
    name: 'Sau tiết 1 không báo cáo là nghỉ học không có lý do',
    category: 'Chuyên cần',
    type: 'penalty',
    points: 2,
    unit: 'lần/em',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Nghỉ học không phép sau tiết 1 không báo cáo. Nghỉ học có phép không trừ điểm.',
  },
  {
    id: 'crit_cc_02',
    code: 'CC02',
    name: 'Bỏ tiết không có lý do',
    category: 'Chuyên cần',
    type: 'penalty',
    points: 2,
    unit: 'lần/em',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Có mặt tại trường nhưng tự ý bỏ tiết không có lý do chính đáng.',
  },

  // 2. Hành vi ứng xử
  {
    id: 'crit_hv_01',
    code: 'HV01',
    name: 'HS đánh nhau',
    category: 'Hành vi ứng xử',
    type: 'penalty',
    points: 10,
    unit: 'lần',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Học sinh tham gia ẩu đả, đánh nhau trong hoặc ngoài trường.',
  },
  {
    id: 'crit_hv_02',
    code: 'HV02',
    name: 'HS bị đánh',
    category: 'Hành vi ứng xử',
    type: 'penalty',
    points: 5,
    unit: 'lần',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Học sinh bị đánh trong các vụ việc xô xát.',
  },
  {
    id: 'crit_hv_03',
    code: 'HV03',
    name: 'Hút thuốc lá, thuốc lá điện tử, chất gây nghiện, cờ bạc (Bị kỷ luật)',
    category: 'Hành vi ứng xử',
    type: 'penalty',
    points: 10,
    unit: 'lần/em',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Học sinh vi phạm chất kích thích, cờ bạc, thuốc lá điện tử, bị hội đồng kỷ luật xử lý.',
  },
  {
    id: 'crit_hv_04',
    code: 'HV04',
    name: 'Trộm cắp bị hạ 1 bậc hạnh kiểm',
    category: 'Hành vi ứng xử',
    type: 'penalty',
    points: 10,
    unit: 'lần',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Hành vi trộm cắp tài sản của bạn, thầy cô hoặc nhà trường, bị hạ 1 bậc hạnh kiểm.',
  },
  {
    id: 'crit_hv_05',
    code: 'HV05',
    name: 'Nói tục, chửi bậy',
    category: 'Hành vi ứng xử',
    type: 'penalty',
    points: 1,
    unit: 'lần',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Phát ngôn thiếu văn minh, chửi bậy trong trường học.',
  },
  {
    id: 'crit_hv_06',
    code: 'HV06',
    name: 'Đi xe trong trường không đúng quy định',
    category: 'Hành vi ứng xử',
    type: 'penalty',
    points: 1,
    unit: 'lần',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Đi xe, phóng nhanh trong sân trường hoặc để xe sai vị trí.',
  },
  {
    id: 'crit_hv_07',
    code: 'HV07',
    name: 'Ăn quà Trong trường',
    category: 'Hành vi ứng xử',
    type: 'penalty',
    points: 1,
    unit: 'lần',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Ăn quà vặt, đồ ăn cổng trường bên trong khuôn viên trường học.',
  },
  {
    id: 'crit_hv_08',
    code: 'HV08',
    name: 'Sử dụng chất thải nhựa, hộp xốp',
    category: 'Hành vi ứng xử',
    type: 'penalty',
    points: 1,
    unit: 'lần',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Mang và sử dụng hộp xốp, túi ni-lông xả thải nhựa dùng một lần.',
  },
  {
    id: 'crit_hv_09',
    code: 'HV09',
    name: 'Đá bóng trong trường không đúng nơi quy định',
    category: 'Hành vi ứng xử',
    type: 'penalty',
    points: 1,
    unit: 'lần',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Đá bóng ở hành lang, sân khu vực học tập gây vỡ kính hoặc nguy hiểm.',
  },
  {
    id: 'crit_hv_10',
    code: 'HV10',
    name: 'HS ra khỏi cổng trường trong buổi học khi không có sự cho phép của giáo viên',
    category: 'Hành vi ứng xử',
    type: 'penalty',
    points: 1,
    unit: 'lần/em',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Tự ý rời khuôn viên trường trong buổi học khi chưa được sự cho phép của giáo viên/nhà trường.',
  },

  // 3. Tác phong - Trang phục
  {
    id: 'crit_tp_01',
    code: 'TP01',
    name: 'HS mặc quần mài rách',
    category: 'Tác phong - Trang phục',
    type: 'penalty',
    points: 1,
    unit: 'lần',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Mặc quần rách, mài kiểu cách không đúng quy chuẩn học sinh THCS.',
  },
  {
    id: 'crit_tp_02',
    code: 'TP02',
    name: 'Không sơ vin',
    category: 'Tác phong - Trang phục',
    type: 'penalty',
    points: 1,
    unit: 'lần',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Không bỏ áo vào quần theo quy định nề nếp trang phục.',
  },
  {
    id: 'crit_tp_03',
    code: 'TP03',
    name: 'Đi dép lê, dẫm quai',
    category: 'Tác phong - Trang phục',
    type: 'penalty',
    points: 1,
    unit: 'lần',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Đi dép lê, dẫm gót quai hậu khi đến trường.',
  },
  {
    id: 'crit_tp_04',
    code: 'TP04',
    name: 'Không đeo khăn quàng',
    category: 'Tác phong - Trang phục',
    type: 'penalty',
    points: 1,
    unit: 'lần',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Đội viên không đeo khăn quàng đỏ trong các buổi học.',
  },
  {
    id: 'crit_tp_05',
    code: 'TP05',
    name: 'HS nhuộm tóc màu sặc sỡ, đánh phấn, sơn móng tay',
    category: 'Tác phong - Trang phục',
    type: 'penalty',
    points: 1,
    unit: 'lần',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Nhuộm tóc sặc sỡ, trang điểm đậm, sơn móng tay móng chân.',
  },
  {
    id: 'crit_tp_06',
    code: 'TP06',
    name: 'Vi phạm đồng phục vào thứ 2,4,6 (các ngày còn lại mặc bình thường áo phải có cổ bẻ)',
    category: 'Tác phong - Trang phục',
    type: 'penalty',
    points: 1,
    unit: 'lỗi/em',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Không mặc áo đồng phục thứ 2, 4, 6. Các ngày khác mặc áo không có cổ bẻ.',
  },
  {
    id: 'crit_tp_07',
    code: 'TP07',
    name: 'Không đeo phù hiệu',
    category: 'Tác phong - Trang phục',
    type: 'penalty',
    points: 1,
    unit: 'lần',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Không đeo phù hiệu / thẻ học sinh theo quy định.',
  },
  {
    id: 'crit_tp_08',
    code: 'TP08',
    name: 'Đeo phù hiệu không đúng, vẽ bậy lên phù hiệu (đối với phân hiệu có làm PH)',
    category: 'Tác phong - Trang phục',
    type: 'penalty',
    points: 2,
    unit: 'lần',
    period: 'week',
    scope: 'sub_with_badge',
    isActive: true,
    condition: 'Áp dụng đối với các phân hiệu có thực hiện làm phù hiệu học sinh.',
    description: 'Đeo sai vị trí hoặc viết, vẽ bậy, bôi bẩn lên phù hiệu học sinh.',
  },

  // 4. Sinh hoạt TT (TPT Đội, Lớp trực đánh giá trực tiếp)
  {
    id: 'crit_sh_01',
    code: 'SH01',
    name: 'Xếp hàng chậm, lộn xộn, mất trật tự bị nhắc nhở',
    category: 'Sinh hoạt TT',
    type: 'penalty',
    points: 2,
    unit: 'lần',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Tập trung xếp hàng chào cờ, thể dục giữa giờ chậm, mất trật tự.',
  },
  {
    id: 'crit_sh_02',
    code: 'SH02',
    name: 'Sinh hoạt lớp đầu giờ HS chạy lộn xộn, ồn ào',
    category: 'Sinh hoạt TT',
    type: 'penalty',
    points: 1,
    unit: 'buổi',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: '15 phút sinh hoạt đầu giờ không nghiêm túc, mất trật tự.',
  },
  {
    id: 'crit_sh_03',
    code: 'SH03',
    name: 'HS trốn SHTT',
    category: 'Sinh hoạt TT',
    type: 'penalty',
    points: 2,
    unit: 'lần/em',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Học sinh trốn giờ sinh hoạt tập thể / sinh hoạt dưới cờ.',
  },

  // 5. Lao động, vệ sinh
  {
    id: 'crit_vs_01',
    code: 'VS01',
    name: 'Trực nhật bẩn ( không làm trực nhật)',
    category: 'Lao động, vệ sinh',
    type: 'penalty',
    points: 2,
    unit: 'lần',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Lớp không làm trực nhật hoặc quét dọn sơ sài, bẩn.',
  },
  {
    id: 'crit_vs_02',
    code: 'VS02',
    name: 'Trực nhật muộn',
    category: 'Lao động, vệ sinh',
    type: 'penalty',
    points: 1,
    unit: 'lần',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Đến trực nhật trễ sau khi trống vào học đã điểm.',
  },
  {
    id: 'crit_vs_03',
    code: 'VS03',
    name: 'Chưa đổ rác',
    category: 'Lao động, vệ sinh',
    type: 'penalty',
    points: 1,
    unit: 'lần',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Để rác tồn đọng trong thùng rác lớp cuối buổi học.',
  },
  {
    id: 'crit_vs_04',
    code: 'VS04',
    name: 'Đổ rác không đúng nơi quy định',
    category: 'Lao động, vệ sinh',
    type: 'penalty',
    points: 1,
    unit: 'lần',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Vứt rác bừa bãi vào bồn hoa, hành lang hoặc hố rác sai vị trí.',
  },
  {
    id: 'crit_vs_05',
    code: 'VS05',
    name: 'Vệ sinh khu vực chung bẩn',
    category: 'Lao động, vệ sinh',
    type: 'penalty',
    points: 2,
    unit: 'lần',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Khu vực sân trường, cầu thang được phân công không được quét sạch.',
  },
  {
    id: 'crit_vs_06',
    code: 'VS06',
    name: 'Vệ sinh bồn hoa',
    category: 'Lao động, vệ sinh',
    type: 'penalty',
    points: 1,
    unit: 'lần',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Bồn hoa cây cảnh được giao bị cỏ rác, chưa nhổ cỏ tỉa cành.',
  },

  // 6. Bảo vệ của công ( Làm hư, hỏng phải đền Theo QĐ của nhà trường)
  {
    id: 'crit_vc_01',
    code: 'VC01',
    name: 'Tất cả HS ra sinh hoạt tập thể hoặc ra về không tắt các thiết bị điện',
    category: 'Bảo vệ của công',
    type: 'penalty',
    points: 2,
    unit: 'lần',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Không tắt quạt, đèn chiếu sáng khi ra khỏi lớp học.',
  },
  {
    id: 'crit_vc_02',
    code: 'VC02',
    name: 'Vẽ bậy (bàn ghế, tường, nơi công cộng)',
    category: 'Bảo vệ của công',
    type: 'penalty',
    points: 2,
    unit: 'lần',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Vẽ, khắc lên mặt bàn ghế học sinh hoặc tường lớp học.',
  },
  {
    id: 'crit_vc_03',
    code: 'VC03',
    name: 'Làm vỡ cửa kính. Làm hỏng đồ dùng của nhà trường',
    category: 'Bảo vệ của công',
    type: 'penalty',
    points: 2,
    unit: 'lần',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Làm hư hại cửa kính, rèm, bàn ghế giáo viên (phải bồi thường theo QĐ).',
  },

  // 7. Trật tự ATGT
  {
    id: 'crit_gt_01',
    code: 'GT01',
    name: 'Không đội mũ bảo hiểm khi đi xe đạp điện, hoặc ngồi sau xe gắn máy, xe điện',
    category: 'Trật tự ATGT',
    type: 'penalty',
    points: 2,
    unit: 'lần',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Không mang mũ bảo hiểm theo đúng quy định an toàn giao thông.',
  },
  {
    id: 'crit_gt_02',
    code: 'GT02',
    name: 'Đội mũ bảo hiểm khi đi xe nhưng không cài quai',
    category: 'Trật tự ATGT',
    type: 'penalty',
    points: 1,
    unit: 'lần',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Có mũ bảo hiểm nhưng không cài quai an toàn.',
  },
  {
    id: 'crit_gt_03',
    code: 'GT03',
    name: 'Xếp xe không ngay ngắn, không đúng nơi QĐ',
    category: 'Trật tự ATGT',
    type: 'penalty',
    points: 2,
    unit: 'lần',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Để xe lộn xộn trong nhà xe hoặc dựng xe sai hàng lối quy định.',
  },
  {
    id: 'crit_gt_04',
    code: 'GT04',
    name: 'Vượt đèn đỏ, đi hàng 3- 4 gây cản trở, ách tắc giao thông',
    category: 'Trật tự ATGT',
    type: 'penalty',
    points: 1,
    unit: 'lần',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Vi phạm luật giao thông đường bộ trước cổng trường hoặc trên đường đi học.',
  },

  // 8. Chất lượng học tập
  {
    id: 'crit_ht_01',
    code: 'HT01',
    name: 'Tiết học xếp loại trung bình',
    category: 'Chất lượng học tập',
    type: 'penalty',
    points: 5,
    unit: 'tiết',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Tiết học được ghi nhận xếp loại Trung bình trong sổ đầu bài.',
  },
  {
    id: 'crit_ht_02',
    code: 'HT02',
    name: '1 Tiết học xếp loại khá',
    category: 'Chất lượng học tập',
    type: 'penalty',
    points: 2,
    unit: 'tiết',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Tiết học được ghi nhận xếp loại Khá trong sổ đầu bài.',
  },
  {
    id: 'crit_ht_03',
    code: 'HT03',
    name: 'Các phân hiệu: 5 con điểm yếu trở lên (trừ không quá 2đ)',
    category: 'Chất lượng học tập',
    type: 'penalty',
    points: 2,
    unit: 'tuần',
    period: 'week',
    scope: 'sub_only',
    maxCap: 2,
    calculationRule: 'weak_score_sub',
    condition: 'Từ 5 con điểm yếu trở lên mới bị trừ 2đ. Giới hạn trừ không quá 2đ.',
    isActive: true,
    description: 'Quy định riêng cho các phân hiệu: từ 5 con điểm yếu trở lên trừ 2đ, tối đa trừ 2đ.',
  },
  {
    id: 'crit_ht_04',
    code: 'HT04',
    name: 'Trường chính: 2 con điểm yếu (Thêm 1 con điểm yếu trở đi trừ thêm 0,5đ)',
    category: 'Chất lượng học tập',
    type: 'penalty',
    points: 1,
    unit: 'tuần',
    period: 'week',
    scope: 'main_only',
    calculationRule: 'weak_score_main',
    condition: 'Đạt từ 2 điểm yếu trừ 1đ; mỗi điểm yếu tiếp theo trừ thêm 0,5đ.',
    isActive: true,
    description: 'Quy định riêng trường chính: 2 con điểm yếu trừ 1đ, từ con thứ 3 trở đi mỗi con trừ thêm 0.5đ.',
  },
  {
    id: 'crit_ht_05',
    code: 'HT05',
    name: 'Sử dụng điện thoại trong giờ hành chính ( Tịch thu đến hết năm học với trả lại)',
    category: 'Chất lượng học tập',
    type: 'penalty',
    points: 5,
    unit: 'lần',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Dùng điện thoại trong giờ học khi chưa được sự cho phép của giáo viên đứng lớp.',
  },

  // 9. Quy chế thi (Trừ điểm tháng)
  {
    id: 'crit_qc_01',
    code: 'QC01',
    name: 'HS vi phạm quy chế thi (lớp bị trừ điểm tháng, HS hạ hạnh kiểm 1 bậc, không xét thi đua)',
    category: 'Quy chế thi',
    type: 'penalty',
    points: 2,
    unit: '1Hs',
    period: 'month',
    scope: 'all',
    isActive: true,
    description: 'Vi phạm quy chế thi cử, kiểm tra định kỳ. Điểm trừ được tính thẳng vào điểm tháng.',
  },

  // 10. Đóng góp – Sổ đầu bài
  {
    id: 'crit_db_01',
    code: 'DB01',
    name: 'Đóng góp các khoản thu của Liên đội không đúng thời gian quy định ( Trừ điểm tuần)',
    category: 'Đóng góp – Sổ đầu bài',
    type: 'penalty',
    points: 2,
    unit: 'lần',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Chậm nộp kế hoạch nhỏ, quỹ Đội hoặc các khoản thu của Liên đội.',
  },
  {
    id: 'crit_db_02',
    code: 'DB02',
    name: 'Sổ đầu bài ghi thiếu, ký thiếu 1 tiết ( lỗi của lớp)',
    category: 'Đóng góp – Sổ đầu bài',
    type: 'penalty',
    points: 1,
    unit: 'tiết',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Ban cán sự lớp không đưa sổ đầu bài để giáo viên bộ môn ghi hoặc ký thiếu tiết.',
  },

  // 11. Đội cờ đỏ
  {
    id: 'crit_cd_01',
    code: 'CD01',
    name: 'Thành viên cờ đỏ không tham gia giao ban',
    category: 'Đội cờ đỏ',
    type: 'penalty',
    points: 5,
    unit: 'lần',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Vắng mặt buổi giao ban sáng thứ 6 hàng tuần của Đội cờ đỏ.',
  },
  {
    id: 'crit_cd_02',
    code: 'CD02',
    name: 'Đi giao ban muộn',
    category: 'Đội cờ đỏ',
    type: 'penalty',
    points: 3,
    unit: 'lần',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Thành viên cờ đỏ đến họp giao ban trễ giờ.',
  },
  {
    id: 'crit_cd_03',
    code: 'CD03',
    name: 'Không mang sổ theo dõi',
    category: 'Đội cờ đỏ',
    type: 'penalty',
    points: 2,
    unit: 'lần',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Không mang theo sổ ghi chép nề nếp chấm chéo khi đi giao ban.',
  },
  {
    id: 'crit_cd_04',
    code: 'CD04',
    name: 'Không mang sổ đầu bài',
    category: 'Đội cờ đỏ',
    type: 'penalty',
    points: 2,
    unit: 'lần',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Không nộp sổ đầu bài của lớp tại buổi giao ban tuần.',
  },

  // 12. Bán trú ( Áp dụng trường chính)
  {
    id: 'crit_bt_01',
    code: 'BT01',
    name: 'Vi phạm nội quy bán trú (Lần 1 nhắc nhở)',
    category: 'Bán trú',
    type: 'penalty',
    points: 0,
    unit: 'lần',
    period: 'week',
    scope: 'main_only',
    isActive: true,
    condition: 'Chỉ áp dụng học sinh bán trú Trường chính. Lần 1: Nhắc nhở, không trừ điểm.',
    description: 'Vi phạm lần 1 bị ban quản lý bán trú lập biên bản nhắc nhở.',
  },
  {
    id: 'crit_bt_02',
    code: 'BT02',
    name: 'Vi phạm nội quy bán trú (Lần 2 trừ 1điểm/1 HS)',
    category: 'Bán trú',
    type: 'penalty',
    points: 1,
    unit: '1 HS',
    period: 'week',
    scope: 'main_only',
    maxCap: 3,
    isActive: true,
    condition: 'Chỉ áp dụng Trường chính. Lần 2 trừ 1đ/HS. Tổng trừ bán trú không quá 3đ.',
    description: 'Vi phạm nội quy bán trú lần 2 theo quy định của ban quản lý bán trú.',
  },
  {
    id: 'crit_bt_03',
    code: 'BT03',
    name: 'Vi phạm nội quy bán trú (Lần 3 Đình chỉ ăn, trừ 3điểm/1HS - Trừ không quá 3 điểm)',
    category: 'Bán trú',
    type: 'penalty',
    points: 3,
    unit: '1 HS',
    period: 'week',
    scope: 'main_only',
    maxCap: 3,
    calculationRule: 'dormitory_step',
    isActive: true,
    condition: 'Chỉ áp dụng Trường chính. Lần 3 đình chỉ ăn và trừ 3đ/HS. Trừ không quá 3 điểm.',
    description: 'Vi phạm nghiêm trọng lần 3 bị đình chỉ ăn bán trú, trừ 3đ/HS, tổng trừ không quá 3đ.',
  },

  // ================= ĐIỂM THƯỞNG =================
  // 1. Học tập (Điểm tốt 9-10đ cộng vào tuần)
  {
    id: 'crit_tt_01',
    code: 'TT01',
    name: 'Sổ đầu bài ghi, ký đầy đủ',
    category: 'Học tập',
    type: 'bonus',
    points: 3,
    unit: 'tuần',
    period: 'week',
    scope: 'all',
    isActive: true,
    description: 'Sổ đầu bài của lớp được giáo viên bộ môn ghi nhận đầy đủ, không thiếu sót chữ ký.',
  },
  {
    id: 'crit_tt_02',
    code: 'TT02',
    name: 'Các phân hiệu: Đạt 5 con điểm tốt (Điểm 9-10)',
    category: 'Học tập',
    type: 'bonus',
    points: 2,
    unit: 'tuần',
    period: 'week',
    scope: 'sub_only',
    calculationRule: 'good_score_sub',
    condition: 'Áp dụng cho các phân hiệu: Đạt từ 5 con điểm tốt (9-10) trong tuần được cộng 2đ.',
    isActive: true,
    description: 'Quy định riêng cho các phân hiệu đạt mốc 5 con điểm tốt.',
  },
  {
    id: 'crit_tt_03',
    code: 'TT03',
    name: 'Trường chính: Các lớp A1 đạt 13 điểm tốt (Cộng không quá 2 điểm)',
    category: 'Học tập',
    type: 'bonus',
    points: 2,
    unit: 'tuần',
    period: 'week',
    scope: 'main_only',
    targetClassType: 'A1',
    maxCap: 2,
    calculationRule: 'good_score_main_a1',
    condition: 'Chỉ áp dụng cho các lớp A1 trường chính (6A1, 7A1, 8A1, 9A1): Đạt từ 13 điểm tốt.',
    isActive: true,
    description: 'Quy định riêng cho các lớp chọn A1 trường chính: Đạt từ 13 con điểm 9-10 cộng 2đ (tối đa 2đ).',
  },
  {
    id: 'crit_tt_04',
    code: 'TT04',
    name: 'Trường chính: Các lớp A2, A3 đạt 10 con điểm tốt (Cộng không quá 2 điểm)',
    category: 'Học tập',
    type: 'bonus',
    points: 2,
    unit: 'tuần',
    period: 'week',
    scope: 'main_only',
    targetClassType: 'A2_A3',
    maxCap: 2,
    calculationRule: 'good_score_main_a2a3',
    condition: 'Chỉ áp dụng cho các lớp A2, A3 trường chính: Đạt từ 10 con điểm tốt.',
    isActive: true,
    description: 'Quy định riêng cho lớp A2, A3 trường chính: Đạt từ 10 con điểm 9-10 cộng 2đ (tối đa 2đ).',
  },

  // 2. HS nhặt được của rơi
  {
    id: 'crit_cr_01',
    code: 'CR01',
    name: 'Nhặt được tiền và đồ rơi có giá trị từ 200.00đ trở đi',
    category: 'HS nhặt được của rơi',
    type: 'bonus',
    points: 0.5,
    unit: 'lần',
    period: 'week',
    scope: 'all',
    isActive: true,
    condition: 'Giá trị từ 200.000đ trở đi; nộp phụ trách Đội để tìm người trả lại hoặc vào quỹ Đội.',
    description: 'Học sinh nhặt được của rơi có giá trị từ 200.000đ trở lên nộp phụ trách Đội.',
  },

  // 3. Các hoạt động khác (Cộng điểm tháng)
  {
    id: 'crit_pt_01',
    code: 'PT01',
    name: 'Giải nhất (Hoạt động phong trào tháng)',
    category: 'Các hoạt động khác',
    type: 'bonus',
    points: 4,
    unit: '1 giải',
    period: 'month',
    scope: 'all',
    isActive: true,
    description: 'Lớp đạt Giải Nhất trong phong trào thi đua tháng của nhà trường.',
  },
  {
    id: 'crit_pt_02',
    code: 'PT02',
    name: 'Giải nhì (Hoạt động phong trào tháng)',
    category: 'Các hoạt động khác',
    type: 'bonus',
    points: 3,
    unit: '1 giải',
    period: 'month',
    scope: 'all',
    isActive: true,
    description: 'Lớp đạt Giải Nhì trong phong trào thi đua tháng của nhà trường.',
  },
  {
    id: 'crit_pt_03',
    code: 'PT03',
    name: 'Giải ba (Hoạt động phong trào tháng)',
    category: 'Các hoạt động khác',
    type: 'bonus',
    points: 2,
    unit: '1 giải',
    period: 'month',
    scope: 'all',
    isActive: true,
    description: 'Lớp đạt Giải Ba trong phong trào thi đua tháng của nhà trường.',
  },
  {
    id: 'crit_pt_04',
    code: 'PT04',
    name: 'Giải KK (Hoạt động phong trào tháng)',
    category: 'Các hoạt động khác',
    type: 'bonus',
    points: 1,
    unit: '1 giải',
    period: 'month',
    scope: 'all',
    isActive: true,
    description: 'Lớp đạt Giải Khuyến Khích phong trào thi đua tháng.',
  },
  {
    id: 'crit_pt_05',
    code: 'PT05',
    name: 'Lớp tham gia các hoạt động phong trào do nhà trường điều động',
    category: 'Các hoạt động khác',
    type: 'bonus',
    points: 2,
    unit: 'đợt',
    period: 'month',
    scope: 'all',
    isActive: true,
    description: 'Tham gia đầy đủ, nhiệt tình các hoạt động phong trào do Ban Giám Hiệu điều động.',
  },
  {
    id: 'crit_pt_06',
    code: 'PT06',
    name: 'Lớp có HS tham gia các cuộc thi khác do cấp trên tổ chức (Từ 2 em trở lên có giải trường chính, phân hiệu 1 em)',
    category: 'Các hoạt động khác',
    type: 'bonus',
    points: 2,
    unit: 'đợt',
    period: 'month',
    scope: 'all',
    calculationRule: 'upper_competition',
    condition: 'Trường chính: từ 2 em trở lên có giải; Các phân hiệu: chỉ cần từ 1 em có giải.',
    isActive: true,
    description: 'Tham gia thi cấp trên có giải: Trường chính cần từ 2 HS, phân hiệu cần từ 1 HS.',
  },

  // 4. Lớp có HS đạt giải các kỳ thi (Cộng điểm cả năm)
  {
    id: 'crit_tg_01',
    code: 'TG01',
    name: 'Lớp có HS tham gia giao lưu CLB các môn văn hóa đạt khối 6,7,8 (Mức 1: Đạt 90% trở lên trường chính, 30% các phân hiệu)',
    category: 'Lớp có HS đạt giải các kỳ thi',
    type: 'bonus',
    points: 2,
    unit: 'năm',
    period: 'year',
    scope: 'all',
    targetGrades: [6, 7, 8],
    calculationRule: 'club_exchange_k678',
    condition: 'Khối 6, 7, 8: Trường chính đạt ≥ 90%; Các phân hiệu đạt ≥ 30%.',
    isActive: true,
    description: 'Cộng điểm cả năm: Giao lưu CLB văn hóa khối 6, 7, 8 đạt tỷ lệ chuẩn cao.',
  },
  {
    id: 'crit_tg_02',
    code: 'TG02',
    name: 'Lớp có HS tham gia giao lưu CLB các môn văn hóa đạt khối 6,7,8 (Mức 2: Đạt 85-89% trường chính, HS có giải ở phân hiệu)',
    category: 'Lớp có HS đạt giải các kỳ thi',
    type: 'bonus',
    points: 1,
    unit: 'năm',
    period: 'year',
    scope: 'all',
    targetGrades: [6, 7, 8],
    calculationRule: 'club_exchange_k678',
    condition: 'Khối 6, 7, 8: Trường chính đạt 85-89%; Phân hiệu có học sinh đạt giải.',
    isActive: true,
    description: 'Cộng điểm cả năm: Giao lưu CLB văn hóa khối 6, 7, 8 đạt tỷ lệ mức 2.',
  },
  {
    id: 'crit_tg_03',
    code: 'TG03',
    name: 'Trường chính: Lớp 9 HS tham gia đội tuyển tỉnh có 80-85% HS đạt giải',
    category: 'Lớp có HS đạt giải các kỳ thi',
    type: 'bonus',
    points: 2,
    unit: 'năm',
    period: 'year',
    scope: 'main_only',
    targetGrades: [9],
    calculationRule: 'provincial_exam_k9',
    condition: 'Chỉ trường chính - Khối 9: Đội tuyển HSG tỉnh đạt tỷ lệ giải 80% - 85%.',
    isActive: true,
    description: 'HS lớp nào tính thành tích cho lớp đó: Đội tuyển tỉnh khối 9 đạt 80-85% giải cộng 2đ.',
  },
  {
    id: 'crit_tg_04',
    code: 'TG04',
    name: 'Trường chính: Lớp 9 HS tham gia đội tuyển tỉnh có 86-89% HS đạt giải',
    category: 'Lớp có HS đạt giải các kỳ thi',
    type: 'bonus',
    points: 3,
    unit: 'năm',
    period: 'year',
    scope: 'main_only',
    targetGrades: [9],
    calculationRule: 'provincial_exam_k9',
    condition: 'Chỉ trường chính - Khối 9: Đội tuyển HSG tỉnh đạt tỷ lệ giải 86% - 89%.',
    isActive: true,
    description: 'HS lớp nào tính thành tích cho lớp đó: Đội tuyển tỉnh khối 9 đạt 86-89% giải cộng 3đ.',
  },
  {
    id: 'crit_tg_05',
    code: 'TG05',
    name: 'Trường chính: Lớp 9 HS tham gia đội tuyển tỉnh có > 90% HS đạt giải',
    category: 'Lớp có HS đạt giải các kỳ thi',
    type: 'bonus',
    points: 5,
    unit: 'năm',
    period: 'year',
    scope: 'main_only',
    targetGrades: [9],
    calculationRule: 'provincial_exam_k9',
    condition: 'Chỉ trường chính - Khối 9: Đội tuyển HSG tỉnh đạt tỷ lệ giải > 90%.',
    isActive: true,
    description: 'HS lớp nào tính thành tích cho lớp đó: Đội tuyển tỉnh khối 9 đạt trên 90% giải cộng 5đ.',
  },
  {
    id: 'crit_tg_06',
    code: 'TG06',
    name: 'Lớp có HS tham gia đội nghi lễ phục vụ LĐ cả năm (Tối đa không quá 0,5đ/lớp)',
    category: 'Lớp có HS đạt giải các kỳ thi',
    type: 'bonus',
    points: 0.1,
    unit: '1 em',
    period: 'year',
    scope: 'all',
    maxCap: 0.5,
    calculationRule: 'ceremony_team',
    condition: '0,1đ/1 em. Tối đa không quá 0,5đ/lớp (tương đương tối đa 5 em).',
    isActive: true,
    description: 'Cộng điểm cả năm: Học sinh tham gia đội trống, đội cờ nghi lễ phục vụ Liên đội cả năm.',
  },
];

/**
 * Evaluates whether a criteria is applicable for a specific class
 */
export function isCriteriaApplicableForClass(
  criteria: Criteria,
  targetClass: ClassItem,
  campus: Campus
): { applicable: boolean; reason?: string } {
  // Check active
  if (!criteria.isActive) {
    return { applicable: false, reason: 'Tiêu chí đang tạm khóa' };
  }

  // Check Scope
  if (criteria.scope === 'main_only' && campus.type !== 'main') {
    return { applicable: false, reason: 'Tiêu chí chỉ áp dụng cho Trường chính' };
  }
  if (criteria.scope === 'sub_only' && campus.type !== 'sub') {
    return { applicable: false, reason: 'Tiêu chí chỉ áp dụng cho các Phân hiệu' };
  }

  // Check Target Grades
  if (criteria.targetGrades && criteria.targetGrades.length > 0) {
    if (!criteria.targetGrades.includes(targetClass.grade)) {
      return {
        applicable: false,
        reason: `Chỉ áp dụng cho Khối ${criteria.targetGrades.join(', ')} (Lớp hiện tại: Khối ${targetClass.grade})`,
      };
    }
  }

  // Check targetClassType for main campus (A1 vs A2, A3)
  if (campus.type === 'main' && criteria.targetClassType) {
    const isA1 = targetClass.name.endsWith('A1');
    if (criteria.targetClassType === 'A1' && !isA1) {
      return { applicable: false, reason: 'Chỉ áp dụng cho lớp A1 trường chính' };
    }
    if (criteria.targetClassType === 'A2_A3' && isA1) {
      return { applicable: false, reason: 'Chỉ áp dụng cho lớp A2, A3 trường chính' };
    }
  }

  return { applicable: true };
}

/**
 * Calculates exact points, applied caps, and descriptive formula for any criteria and quantity
 */
export function calculateCriteriaPoints(
  criteria: Criteria,
  quantity: number,
  targetClass: ClassItem,
  campus: Campus,
  config: EvaluationConfig = DEFAULT_EVALUATION_CONFIG
): {
  pointsPerUnit: number;
  totalPoints: number; // Signed: positive if bonus, negative if penalty
  appliedCap?: number;
  calculationDetail: string;
  isDisciplinary: boolean;
} {
  const isBonus = criteria.type === 'bonus';
  let totalMagnitude = 0;
  let calculationDetail = '';
  let appliedCap: number | undefined = undefined;
  let isDisciplinary = false;

  // Check disciplinary
  if (
    criteria.id === 'crit_hv_03' ||
    criteria.id === 'crit_hv_04' ||
    criteria.name.includes('Bị kỷ luật') ||
    criteria.name.includes('hạ 1 bậc hạnh kiểm')
  ) {
    isDisciplinary = true;
  }

  // Check specific calculation rules defined in PDF
  switch (criteria.calculationRule) {
    // 1. Điểm yếu tại Trường chính: 2 con điểm yếu trừ 1đ, mỗi con tiếp theo trừ 0.5đ
    case 'weak_score_main': {
      const baseThreshold = config.mainWeakBaseThreshold; // 2
      const basePoints = config.mainWeakBasePoints; // 1
      const stepPoints = config.mainWeakStepPoints; // 0.5

      if (quantity < baseThreshold) {
        totalMagnitude = 0;
        calculationDetail = `Dưới ${baseThreshold} con điểm yếu (${quantity} con): Chưa chạm ngưỡng trừ điểm`;
      } else {
        const extraCount = quantity - baseThreshold;
        totalMagnitude = basePoints + extraCount * stepPoints;
        calculationDetail = `${baseThreshold} con đầu trừ ${basePoints}đ + ${extraCount} con tiếp theo x ${stepPoints}đ = -${totalMagnitude}đ`;
      }
      break;
    }

    // 2. Điểm yếu tại Các phân hiệu: từ 5 con điểm yếu trở lên trừ 2đ (trừ không quá 2đ)
    case 'weak_score_sub': {
      const threshold = config.subWeakThreshold; // 5
      const penalty = config.subWeakPenalty; // 2
      const cap = config.subWeakMaxCap; // 2

      if (quantity < threshold) {
        totalMagnitude = 0;
        calculationDetail = `Dưới ${threshold} con điểm yếu (${quantity} con): Chưa chạm ngưỡng trừ điểm`;
      } else {
        totalMagnitude = Math.min(penalty, cap);
        appliedCap = cap;
        calculationDetail = `Đạt ${quantity} con điểm yếu (≥ ${threshold} con): Trừ ${penalty}đ (Giới hạn trừ không quá ${cap}đ)`;
      }
      break;
    }

    // 3. Điểm tốt Trường chính lớp A1: 13 con điểm tốt cộng 2đ (cộng không quá 2đ)
    case 'good_score_main_a1': {
      const threshold = config.mainA1GoodThreshold; // 13
      const bonus = config.goodScoreBonus; // 2
      const cap = config.goodScoreMaxCap; // 2

      if (quantity < threshold) {
        totalMagnitude = 0;
        calculationDetail = `Lớp A1 đạt ${quantity}/${threshold} điểm tốt: Chưa đủ định mức để cộng điểm`;
      } else {
        totalMagnitude = Math.min(bonus, cap);
        appliedCap = cap;
        calculationDetail = `Lớp A1 đạt ${quantity} điểm tốt (≥ ${threshold} con): Cộng ${bonus}đ (Giới hạn tối đa ${cap}đ)`;
      }
      break;
    }

    // 4. Điểm tốt Trường chính lớp A2, A3: 10 con điểm tốt cộng 2đ (cộng không quá 2đ)
    case 'good_score_main_a2a3': {
      const threshold = config.mainA2A3GoodThreshold; // 10
      const bonus = config.goodScoreBonus; // 2
      const cap = config.goodScoreMaxCap; // 2

      if (quantity < threshold) {
        totalMagnitude = 0;
        calculationDetail = `Lớp A2/A3 đạt ${quantity}/${threshold} điểm tốt: Chưa đủ định mức để cộng điểm`;
      } else {
        totalMagnitude = Math.min(bonus, cap);
        appliedCap = cap;
        calculationDetail = `Lớp A2/A3 đạt ${quantity} điểm tốt (≥ ${threshold} con): Cộng ${bonus}đ (Giới hạn tối đa ${cap}đ)`;
      }
      break;
    }

    // 5. Điểm tốt Các phân hiệu: 5 con điểm tốt cộng 2đ
    case 'good_score_sub': {
      const threshold = config.subGoodThreshold; // 5
      const bonus = config.goodScoreBonus; // 2

      if (quantity < threshold) {
        totalMagnitude = 0;
        calculationDetail = `Phân hiệu đạt ${quantity}/${threshold} điểm tốt: Chưa đủ định mức`;
      } else {
        totalMagnitude = bonus;
        calculationDetail = `Phân hiệu đạt ${quantity} điểm tốt (≥ ${threshold} con): Cộng ${bonus}đ`;
      }
      break;
    }

    // 6. Bán trú trường chính: Lần 3 đình chỉ ăn, trừ 3đ/HS (Trừ không quá 3 điểm)
    case 'dormitory_step': {
      const cap = config.dormitoryMaxCap; // 3
      const raw = criteria.points * quantity;
      totalMagnitude = Math.min(raw, cap);
      appliedCap = cap;
      calculationDetail = `${quantity} HS vi phạm bán trú x ${criteria.points}đ = ${raw}đ (Giới hạn trừ không quá ${cap}đ)`;
      break;
    }

    // 7. Đội nghi lễ phục vụ Liên đội cả năm: 0.1đ/1 em, tối đa không quá 0.5đ/lớp
    case 'ceremony_team': {
      const cap = config.ceremonyMaxCap; // 0.5
      const raw = Number((criteria.points * quantity).toFixed(2));
      totalMagnitude = Math.min(raw, cap);
      appliedCap = cap;
      calculationDetail = `${quantity} em đội nghi lễ x ${criteria.points}đ = ${raw}đ (Tối đa không quá ${cap}đ/lớp)`;
      break;
    }

    // 8. Các trường hợp tiêu chuẩn có thể có maxCap
    default: {
      const raw = criteria.points * quantity;
      if (criteria.maxCap && raw > criteria.maxCap) {
        totalMagnitude = criteria.maxCap;
        appliedCap = criteria.maxCap;
        calculationDetail = `${quantity} ${criteria.unit} x ${criteria.points}đ = ${raw}đ (Giới hạn tối đa ${criteria.maxCap}đ)`;
      } else {
        totalMagnitude = raw;
        calculationDetail = `${quantity} ${criteria.unit} x ${criteria.points}đ = ${raw}đ`;
      }
      break;
    }
  }

  // Format final signed points
  const totalPoints = isBonus ? totalMagnitude : -totalMagnitude;

  return {
    pointsPerUnit: criteria.points,
    totalPoints,
    appliedCap,
    calculationDetail,
    isDisciplinary,
  };
}

/**
 * Finds the corresponding month for a given school week based on settings
 */
export function getMonthForWeek(week: number, monthWeeksMap: Record<number, number[]>): number {
  for (const [mStr, weeks] of Object.entries(monthWeeksMap)) {
    if (weeks.includes(week)) {
      return Number(mStr);
    }
  }
  // Default fallback: weeks 1-4 = Sep, 5-8 = Oct, 9-13 = Nov, 14-18 = Dec, 19-22 = Jan, 23-26 = Feb, 27-30 = Mar, 31-35 = Apr
  if (week <= 4) return 9;
  if (week <= 8) return 10;
  if (week <= 13) return 11;
  if (week <= 18) return 12;
  if (week <= 22) return 1;
  if (week <= 26) return 2;
  if (week <= 30) return 3;
  return 4;
}

/**
 * Finds semester for a given month or week
 */
export function getSemesterForWeek(week: number): 1 | 2 {
  return week <= 18 ? 1 : 2;
}

export function getSemesterForMonth(month: number): 1 | 2 {
  return [9, 10, 11, 12].includes(month) ? 1 : 2;
}
