// 7 official roles as requested:
// 1. SUPER ADMIN (Toàn quyền toàn hệ thống)
// 2. BAN GIÁM HIỆU (Xem toàn trường, duyệt và chốt dữ liệu, xem báo cáo)
// 3. QUẢN TRỊ VIÊN PHÂN HIỆU (Chỉ quản lý phân hiệu được phân công)
// 4. TPT ĐỘI / PHỤ TRÁCH ĐỘI (Nhập và quản lý dữ liệu thi đua của phân hiệu được giao)
// 5. GIÁO VIÊN CHỦ NHIỆM (Chỉ xem lớp mình phụ trách, có thể gửi phản hồi hoặc đề nghị điều chỉnh)
// 6. ĐỘI CỜ ĐỎ (Chỉ được nhập dữ liệu theo nhiệm vụ)
// 7. NGƯỜI XEM (Chỉ được xem báo cáo)
export type RoleType =
  | 'super_admin'
  | 'bgh'
  | 'campus_admin'
  | 'tpt_doi'
  | 'gvcn'
  | 'red_flag'
  | 'viewer'
  // Legacy aliases for backward-compatibility
  | 'admin'
  | 'inspector'
  | 'campus_lead'
  | 'teacher'
  | 'public';

export interface User {
  id: string;
  name: string;
  role: RoleType;
  email: string;
  campusId?: string; // If campus_admin, tpt_doi, or gvcn
  classId?: string; // If gvcn (Giáo viên chủ nhiệm)
  dutyDays?: ('Thứ 2' | 'Thứ 3' | 'Thứ 4' | 'Thứ 5' | 'Thứ 6' | 'Thứ 7')[]; // If red_flag
  dutyArea?: string; // If red_flag
  avatar?: string;
  title: string;
  phone?: string;
}

export type AuditAction =
  | 'THEM_DIEM'             // Thêm điểm vi phạm/khen thưởng
  | 'SUA_DIEM'              // Sửa điểm vi phạm/khen thưởng
  | 'XOA_DIEM'              // Xóa điểm vi phạm/khen thưởng
  | 'CHOT_DU_LIEU_TUAN'     // Chốt khóa điểm thi đua tuần
  | 'MO_KHOA_TUAN'          // Mở khóa điểm thi đua tuần
  | 'THEM_LOP'              // Thêm lớp học
  | 'SUA_LOP'               // Sửa thông tin lớp học
  | 'XOA_LOP'               // Xóa lớp học
  | 'THEM_PHAN_HIEU'        // Thêm phân hiệu
  | 'SUA_PHAN_HIEU'         // Sửa phân hiệu
  | 'XOA_PHAN_HIEU'         // Xóa phân hiệu
  | 'PHAN_CONG_CO_DO'       // Phân công lịch trực cờ đỏ
  | 'XOA_LICH_CO_DO'        // Xóa lịch trực cờ đỏ
  | 'GUI_DE_NGHI_DIEU_CHINH'// GVCN gửi đề nghị điều chỉnh
  | 'DUYET_DIEU_CHINH'      // BGH/TPT duyệt điều chỉnh điểm
  | 'TU_CHOI_DIEU_CHINH'    // BGH/TPT từ chối điều chỉnh
  | 'CAP_NHAT_CAU_HINH'     // Cập nhật cấu hình hệ thống
  | 'THEM_NGUOI_DUNG'       // Thêm tài khoản người dùng
  | 'SUA_NGUOI_DUNG'        // Sửa quyền/thông tin người dùng
  | 'XOA_NGUOI_DUNG'        // Xóa tài khoản người dùng
  | 'KHOI_PHUC_HE_THONG'    // Khôi phục dữ liệu mẫu gốc
  | 'CHUYEN_NAM_HOC'        // Chuyển hoặc tạo năm học mới
  | 'SAO_LUU_HE_THONG'      // Xuất bản sao lưu hệ thống
  | 'PHUC_HOI_HE_THONG'     // Phục hồi hệ thống từ bản sao lưu
  | 'XUAT_EXCEL_TONG_HOP'   // Xuất báo cáo Excel tổng hợp
  | 'KIEM_TRA_TOAN_VEN';    // Chạy rà soát kiểm tra tính toàn vẹn hệ thống

export interface AcademicYearArchive {
  id: string;
  year: string; // e.g. "2025-2026"
  archivedAt: string;
  archivedBy: string;
  totalClasses: number;
  totalScoreLogs: number;
  lockedWeeks: number[];
  classesSnapshot: ClassItem[];
  scoreLogsSnapshot: ScoreLog[];
  settingsSnapshot: SchoolSettings;
  note?: string;
}

export interface SystemFullBackupPayload {
  version: string;
  appName: string;
  exportedAt: string;
  exportedBy: string;
  settings: SchoolSettings;
  campuses: Campus[];
  classes: ClassItem[];
  criteria: Criteria[];
  scoreLogs: ScoreLog[];
  lockedWeeks: number[];
  appeals: AdjustmentAppeal[];
  auditLogs: AuditLog[];
  academicYearArchives: AcademicYearArchive[];
  users: User[];
  redFlagDuties?: any[];
  checksum?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string; // ISO string
  userId: string;
  userName: string;
  userRole: RoleType;
  action: AuditAction;
  entityType: 'score_log' | 'class' | 'campus' | 'week_lock' | 'appeal' | 'settings' | 'user' | 'red_flag' | 'criteria';
  entityId: string;
  campusId?: string;
  classId?: string;
  beforeData?: any;
  afterData?: any;
  details: string;
}

export type AppealStatus = 'pending' | 'approved' | 'rejected';
export type AppealType = 'adjust_score' | 'remove_penalty' | 'add_bonus' | 'dispute_violation';

export interface AdjustmentAppeal {
  id: string;
  createdAt: string; // ISO
  classId: string;
  className: string;
  campusId: string;
  campusName: string;
  teacherId: string;
  teacherName: string;
  week: number;
  scoreLogId?: string; // Target violation/bonus log if adjusting existing one
  criteriaName?: string;
  appealType: AppealType;
  reason: string;
  evidenceNotes?: string; // Ghi chú minh chứng
  proposedPoints?: number;
  status: AppealStatus;
  reviewerId?: string;
  reviewerName?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  resultingScoreLogId?: string; // ID of log created/updated after approval
}

export interface Campus {
  id: string;
  code: string;
  name: string;
  type: 'main' | 'sub';
  leaderName: string;
  phone: string;
  address: string;
  description?: string;
  colorTheme: string;
}

export interface ClassItem {
  id: string;
  name: string; // e.g., '6A1', '9G2'
  grade: 6 | 7 | 8 | 9;
  campusId: string;
  homeroomTeacher: string; // GVCN
  monitorName: string; // Lớp trưởng
  studentCount: number;
  roomNumber?: string;
}

export type CriteriaCategory =
  | 'Chuyên cần'
  | 'Hành vi ứng xử'
  | 'Tác phong - Trang phục'
  | 'Sinh hoạt TT'
  | 'Lao động, vệ sinh'
  | 'Bảo vệ của công'
  | 'Trật tự ATGT'
  | 'Chất lượng học tập'
  | 'Quy chế thi'
  | 'Đóng góp – Sổ đầu bài'
  | 'Đội cờ đỏ'
  | 'Bán trú'
  | 'Học tập'
  | 'HS nhặt được của rơi'
  | 'Các hoạt động khác'
  | 'Lớp có HS đạt giải các kỳ thi'
  | 'Khác';

export type CriteriaType = 'bonus' | 'penalty';
export type CriteriaPeriod = 'week' | 'month' | 'year';
export type CriteriaScope = 'all' | 'main_only' | 'sub_only' | 'sub_with_badge';
export type CalculationRuleType =
  | 'standard'
  | 'weak_score_main'
  | 'weak_score_sub'
  | 'good_score_main_a1'
  | 'good_score_main_a2a3'
  | 'good_score_sub'
  | 'dormitory_step'
  | 'ceremony_team'
  | 'provincial_exam_k9'
  | 'club_exchange_k678'
  | 'upper_competition';

export interface Criteria {
  id: string;
  code: string;
  name: string;
  category: CriteriaCategory;
  type: CriteriaType;
  points: number; // Điểm cơ bản
  unit: string; // 'lần', 'tiết', 'buổi', 'lần/em', 'tuần', 'giải', 'em', 'lỗi/em'
  period: CriteriaPeriod; // 'week' | 'month' | 'year'
  scope: CriteriaScope; // 'all' | 'main_only' | 'sub_only' | 'sub_with_badge'
  targetGrades?: number[]; // [6,7,8] hoặc [9], undefined = tất cả các khối
  targetClassType?: 'all' | 'A1' | 'A2_A3'; // Dành riêng cho phân loại lớp A1 vs A2, A3 trường chính
  condition?: string; // Mô tả điều kiện áp dụng
  maxCap?: number; // Giới hạn điểm cộng/trừ tối đa nếu có
  calculationRule?: CalculationRuleType; // Quy tắc tính điểm động
  isActive: boolean;
  description?: string;
}

export interface ScoreLog {
  id: string;
  week: number;
  month?: number;
  semester?: 1 | 2;
  period: CriteriaPeriod;
  classId: string;
  className: string;
  campusId: string;
  campusName: string;
  campusType: 'main' | 'sub';
  grade: number;
  criteriaId: string;
  criteriaCode: string;
  criteriaName: string;
  category: CriteriaCategory;
  type: CriteriaType;
  pointsPerUnit: number;
  quantity: number;
  totalPoints: number; // positive if bonus, negative if penalty
  appliedCap?: number;
  calculationDetail?: string;
  note?: string;
  date: string; // YYYY-MM-DD
  recordedBy: string;
  inspectorName: string;
  isDisciplinary?: boolean; // Nếu vi phạm bị hội đồng kỷ luật xử lý -> Không xếp loại cả năm
}

export interface ClassWeeklyScore {
  classId: string;
  week: number;
  baseScore: number; // default 100
  bonusPoints: number;
  penaltyPoints: number;
  finalScore: number;
  logCount: number;
  rankInCampus?: number;
  rankInSchool?: number;
}

export interface RankingEntry {
  rank: number;
  classItem: ClassItem;
  campus: Campus;
  totalScore: number;
  baseScore: number;
  bonusPoints: number;
  penaltyPoints: number;
  monthBonusPoints?: number;
  monthPenaltyPoints?: number;
  yearBonusPoints?: number;
  logCount: number;
  performanceTier: 'Xuất sắc' | 'Tốt' | 'Khá' | 'Trung bình' | 'Cần cố gắng';
  averageScore?: number;
  weekBreakdown?: { week: number; score: number }[];
  semester1Score?: number;
  semester2Score?: number;
  isDisqualifiedYearly?: boolean;
  disqualificationReason?: string;
}

export interface EvaluationConfig {
  advancedClassesRatio: number; // default 0.70 (70% lớp tiên tiến trở lên)
  excellentClassesRatio: number; // default 0.35 (35% lớp xuất sắc)
  goodClassesRatio: number; // default 0.35 (35% lớp tiên tiến)
  allowMainCampusExceed70: boolean; // default true
  mainWeakBaseThreshold: number; // default 2
  mainWeakBasePoints: number; // default 1
  mainWeakStepPoints: number; // default 0.5
  subWeakThreshold: number; // default 5
  subWeakPenalty: number; // default 2
  subWeakMaxCap: number; // default 2
  mainA1GoodThreshold: number; // default 13
  mainA2A3GoodThreshold: number; // default 10
  subGoodThreshold: number; // default 5
  goodScoreBonus: number; // default 2
  goodScoreMaxCap: number; // default 2
  dormitoryMaxCap: number; // default 3
  ceremonyMaxCap: number; // default 0.5
  lostFoundValueThreshold: number; // default 200000
}

export interface RedFlagDuty {
  id: string;
  week: number;
  campusId: string;
  dayOfWeek: 'Thứ 2' | 'Thứ 3' | 'Thứ 4' | 'Thứ 5' | 'Thứ 6' | 'Thứ 7';
  assignedClassId: string; // Class in charge of duty
  assignedClassName: string;
  inspectorNames: string; // E.g. 'Lê Hải Đăng, Nguyễn Thu Hà'
  dutyArea: string; // E.g. 'Khu phòng học Khối 8 & Khối 9'
  notes?: string;
  createdAt?: string;
}

export interface SchoolSettings {
  schoolName: string;
  academicYear: string;
  basePointsPerWeek: number;
  currentWeek: number;
  totalWeeksSemester1: number;
  totalWeeksSemester2: number;
  monthWeeksMap: Record<number, number[]>; // Month -> array of weeks
  yearFormula: string; // '(HK1 + HK2 * 2) / 3'
  evaluationConfig: EvaluationConfig;
  lockedWeeks?: number[]; // Weeks locked by TPT Đội or Admin
}

export type ViewTab = 
  | 'dashboard'
  | 'campuses'
  | 'classes'
  | 'redflag'
  | 'scoring'
  | 'criteria'
  | 'rankings'
  | 'reports'
  | 'datalock'
  | 'appeals'
  | 'audit_logs'
  | 'users'
  | 'settings';

export interface RoleMeta {
  role: RoleType;
  title: string;
  badge: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

export const ROLE_METAS: Record<string, RoleMeta> = {
  super_admin: {
    role: 'super_admin',
    title: 'SUPER ADMIN',
    badge: 'Toàn quyền',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    description: 'Toàn quyền tối cao toàn hệ thống: Cấu hình, phân quyền, quản lý 6 phân hiệu, 59 lớp, audit log, chốt dữ liệu.',
  },
  bgh: {
    role: 'bgh',
    title: 'BAN GIÁM HIỆU',
    badge: 'Ban Giám Hiệu',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Xem toàn trường, duyệt và chốt dữ liệu thi đua tuần/tháng/kỳ, duyệt điều chỉnh điểm, xem báo cáo toàn diện.',
  },
  campus_admin: {
    role: 'campus_admin',
    title: 'QUẢN TRỊ VIÊN PHÂN HIỆU',
    badge: 'QTV Phân Hiệu',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description: 'Chỉ quản lý phân hiệu được phân công (các lớp, phân công cờ đỏ, duyệt đề nghị lớp mình).',
  },
  tpt_doi: {
    role: 'tpt_doi',
    title: 'TPT ĐỘI / PHỤ TRÁCH ĐỘI',
    badge: 'Tổng Phụ Trách',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    description: 'Nhập và quản lý dữ liệu thi đua của phân hiệu được giao, điều phối cờ đỏ, giải quyết khiếu nại.',
  },
  gvcn: {
    role: 'gvcn',
    title: 'GIÁO VIÊN CHỦ NHIỆM',
    badge: 'GVCN Lớp',
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    description: 'Chỉ xem lớp mình phụ trách, xem chi tiết điểm cộng/trừ, gửi phản hồi hoặc đề nghị điều chỉnh điểm.',
  },
  red_flag: {
    role: 'red_flag',
    title: 'ĐỘI CỜ ĐỎ',
    badge: 'Cờ Đỏ Trực Nhật',
    color: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    description: 'Chỉ được nhập dữ liệu chấm điểm vi phạm/khen thưởng theo nhiệm vụ và khu vực được phân công.',
  },
  viewer: {
    role: 'viewer',
    title: 'NGƯỜI XEM',
    badge: 'Chỉ Xem',
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-200',
    description: 'Chỉ được xem bảng xếp hạng công khai và các báo cáo thi đua tổng hợp, không sửa đổi dữ liệu.',
  },
  // Legacy aliases
  admin: {
    role: 'super_admin',
    title: 'SUPER ADMIN',
    badge: 'Toàn quyền',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    description: 'Toàn quyền tối cao toàn hệ thống',
  },
  inspector: {
    role: 'tpt_doi',
    title: 'TPT ĐỘI / PHỤ TRÁCH ĐỘI',
    badge: 'Tổng Phụ Trách',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    description: 'Nhập và quản lý dữ liệu thi đua của phân hiệu được giao',
  },
  campus_lead: {
    role: 'campus_admin',
    title: 'QUẢN TRỊ VIÊN PHÂN HIỆU',
    badge: 'QTV Phân Hiệu',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description: 'Chỉ quản lý phân hiệu được phân công',
  },
  teacher: {
    role: 'gvcn',
    title: 'GIÁO VIÊN CHỦ NHIỆM',
    badge: 'GVCN Lớp',
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    description: 'Chỉ xem lớp mình phụ trách, có thể gửi phản hồi',
  },
  public: {
    role: 'viewer',
    title: 'NGƯỜI XEM',
    badge: 'Chỉ Xem',
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-200',
    description: 'Chỉ được xem báo cáo',
  },
};

export function normalizeRole(role: RoleType | string): RoleType {
  switch (role) {
    case 'admin':
    case 'super_admin':
      return 'super_admin';
    case 'bgh':
      return 'bgh';
    case 'campus_lead':
    case 'campus_admin':
      return 'campus_admin';
    case 'inspector':
    case 'tpt_doi':
      return 'tpt_doi';
    case 'teacher':
    case 'gvcn':
      return 'gvcn';
    case 'red_flag':
      return 'red_flag';
    case 'public':
    case 'viewer':
    default:
      return 'viewer';
  }
}

