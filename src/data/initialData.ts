import { Campus, ClassItem, Criteria, SchoolSettings, User, ScoreLog, RedFlagDuty, AuditLog, AdjustmentAppeal } from '../types';
import {
  DEFAULT_EVALUATION_CONFIG,
  OFFICIAL_CRITERIA_DATABASE,
  calculateCriteriaPoints,
} from '../utils/criteriaEngine';

export const INITIAL_SETTINGS: SchoolSettings = {
  schoolName: 'Trường THCS Lê Hữu Lập',
  academicYear: '2026-2027',
  basePointsPerWeek: 100,
  currentWeek: 4,
  totalWeeksSemester1: 18,
  totalWeeksSemester2: 17,
  monthWeeksMap: {
    9: [1, 2, 3, 4],
    10: [5, 6, 7, 8],
    11: [9, 10, 11, 12, 13],
    12: [14, 15, 16, 17, 18],
    1: [19, 20, 21, 22],
    2: [23, 24, 25, 26],
    3: [27, 28, 29, 30],
    4: [31, 32, 33, 34, 35],
  },
  yearFormula: '(HK1 + HK2 * 2) / 3',
  evaluationConfig: DEFAULT_EVALUATION_CONFIG,
  lockedWeeks: [1, 2, 3], // Tuần 1, 2, 3 đã được TPT Đội chốt khóa; Tuần 4 đang mở chấm
};

export const INITIAL_CAMPUSES: Campus[] = [
  {
    id: 'lhl_main',
    code: 'LHL',
    name: 'Lê Hữu Lập – Trường chính',
    type: 'main',
    leaderName: 'Thầy Hoàng Văn Sơn',
    phone: '0912.345.678',
    address: 'Khu 2, Thị trấn Hậu Lộc, Thanh Hóa',
    description: 'Cơ sở chính điều hành, đầy đủ trang thiết bị, có tổ chức bán trú.',
    colorTheme: 'indigo',
  },
  {
    id: 'hau_loc',
    code: 'HL',
    name: 'Hậu Lộc',
    type: 'sub',
    leaderName: 'Cô Phạm Thị Mai',
    phone: '0983.112.233',
    address: 'Khu 4, Xã Hậu Lộc, Thanh Hóa',
    description: 'Phân hiệu Hậu Lộc, phong trào học tập tích cực.',
    colorTheme: 'emerald',
  },
  {
    id: 'loc_tan',
    code: 'LT',
    name: 'Lộc Tân',
    type: 'sub',
    leaderName: 'Thầy Đỗ Quốc Tuấn',
    phone: '0977.445.566',
    address: 'Thôn Trung Tân, Xã Lộc Tân, Thanh Hóa',
    description: 'Phân hiệu Lộc Tân, nề nếp kỷ luật tốt.',
    colorTheme: 'blue',
  },
  {
    id: 'loc_son',
    code: 'LS',
    name: 'Lộc Sơn',
    type: 'sub',
    leaderName: 'Cô Lê Thu Hằng',
    phone: '0915.667.788',
    address: 'Khu phố 1, Xã Lộc Sơn, Thanh Hóa',
    description: 'Phân hiệu Lộc Sơn, bề dày phong trào văn thể mỹ.',
    colorTheme: 'amber',
  },
  {
    id: 'my_loc',
    code: 'ML',
    name: 'Mỹ Lộc',
    type: 'sub',
    leaderName: 'Thầy Nguyễn Văn Hưng',
    phone: '0904.889.900',
    address: 'Thôn Hưng Lộc, Xã Mỹ Lộc, Thanh Hóa',
    description: 'Phân hiệu Mỹ Lộc, tinh thần vượt khó thi đua tốt.',
    colorTheme: 'rose',
  },
  {
    id: 'thuan_loc',
    code: 'TL',
    name: 'Thuần Lộc',
    type: 'sub',
    leaderName: 'Cô Trần Bích Ngọc',
    phone: '0936.554.433',
    address: 'Xã Thuần Lộc, Thanh Hóa',
    description: 'Phân hiệu Thuần Lộc, quy mô 12 lớp với nhiều thành tích nổi bật.',
    colorTheme: 'teal',
  },
];

// 59 classes according to school organization (6 Phân hiệu):
// 1. Lê Hữu Lập: 12 lớp (6A1->6A3, 7A1->7A3, 8A1->8A3, 9A1->9A3)
// 2. Hậu Lộc: 11 lớp (6G1,6G2,6G3, 7G1,7G2, 8G1->8G3, 9G1->9G3)
// 3. Lộc Tân: 8 lớp (6E1,6E2, 7E1,7E2, 8E1,8E2, 9E1,9E2)
// 4. Lộc Sơn: 8 lớp (6C1,6C2, 7C1,7C2, 8C1,8C2, 9C1,9C2)
// 5. Mỹ Lộc: 8 lớp (6D1,6D2, 7D1,7D2, 8D1,8D2, 9D1,9D2)
// 6. Thuần Lộc: 12 lớp (6B1->6B3, 7B1->7B3, 8B1->8B3, 9B1->9B3)
export const INITIAL_CLASSES: ClassItem[] = [
  // Lê Hữu Lập (12 classes)
  { id: 'c_6a1', name: '6A1', grade: 6, campusId: 'lhl_main', homeroomTeacher: 'Nguyễn Thị Thu', monitorName: 'Trần Bảo An', studentCount: 42, roomNumber: 'P.101' },
  { id: 'c_6a2', name: '6A2', grade: 6, campusId: 'lhl_main', homeroomTeacher: 'Lê Văn Hiếu', monitorName: 'Nguyễn Minh Khoa', studentCount: 40, roomNumber: 'P.102' },
  { id: 'c_6a3', name: '6A3', grade: 6, campusId: 'lhl_main', homeroomTeacher: 'Phạm Mai Linh', monitorName: 'Đặng Ngọc Ánh', studentCount: 41, roomNumber: 'P.103' },
  { id: 'c_7a1', name: '7A1', grade: 7, campusId: 'lhl_main', homeroomTeacher: 'Vũ Đức Nam', monitorName: 'Lê Gia Hân', studentCount: 39, roomNumber: 'P.201' },
  { id: 'c_7a2', name: '7A2', grade: 7, campusId: 'lhl_main', homeroomTeacher: 'Hoàng Kim Chi', monitorName: 'Bùi Tuấn Kiệt', studentCount: 43, roomNumber: 'P.202' },
  { id: 'c_7a3', name: '7A3', grade: 7, campusId: 'lhl_main', homeroomTeacher: 'Đinh Tiến Đạt', monitorName: 'Hoàng Thùy Linh', studentCount: 38, roomNumber: 'P.203' },
  { id: 'c_8a1', name: '8A1', grade: 8, campusId: 'lhl_main', homeroomTeacher: 'Trịnh Thúy Nga', monitorName: 'Nguyễn Khánh Linh', studentCount: 44, roomNumber: 'P.301' },
  { id: 'c_8a2', name: '8A2', grade: 8, campusId: 'lhl_main', homeroomTeacher: 'Lý Quốc Cường', monitorName: 'Vũ Hải Đăng', studentCount: 41, roomNumber: 'P.302' },
  { id: 'c_8a3', name: '8A3', grade: 8, campusId: 'lhl_main', homeroomTeacher: 'Bùi Thị Hà', monitorName: 'Phạm Minh Đức', studentCount: 40, roomNumber: 'P.303' },
  { id: 'c_9a1', name: '9A1', grade: 9, campusId: 'lhl_main', homeroomTeacher: 'Lê Thanh Hoa', monitorName: 'Trịnh Hoàng Long', studentCount: 45, roomNumber: 'P.401' },
  { id: 'c_9a2', name: '9A2', grade: 9, campusId: 'lhl_main', homeroomTeacher: 'Ngô Văn Tùng', monitorName: 'Nguyễn Thảo Nguyên', studentCount: 42, roomNumber: 'P.402' },
  { id: 'c_9a3', name: '9A3', grade: 9, campusId: 'lhl_main', homeroomTeacher: 'Dương Thị Yến', monitorName: 'Lê Đình Quang', studentCount: 43, roomNumber: 'P.403' },

  // Hậu Lộc (11 classes)
  { id: 'c_6g1', name: '6G1', grade: 6, campusId: 'hau_loc', homeroomTeacher: 'Đặng Thanh Tâm', monitorName: 'Trần Gia Bảo', studentCount: 38, roomNumber: 'P.01' },
  { id: 'c_6g2', name: '6G2', grade: 6, campusId: 'hau_loc', homeroomTeacher: 'Trần Quốc Việt', monitorName: 'Lê Phương Thảo', studentCount: 39, roomNumber: 'P.02' },
  { id: 'c_6g3', name: '6G3', grade: 6, campusId: 'hau_loc', homeroomTeacher: 'Nguyễn Văn Tiến', monitorName: 'Trịnh Khánh Huyền', studentCount: 38, roomNumber: 'P.11' },
  { id: 'c_7g1', name: '7G1', grade: 7, campusId: 'hau_loc', homeroomTeacher: 'Vũ Thị Minh', monitorName: 'Phạm Quốc Cường', studentCount: 40, roomNumber: 'P.03' },
  { id: 'c_7g2', name: '7G2', grade: 7, campusId: 'hau_loc', homeroomTeacher: 'Mai Văn Quân', monitorName: 'Hoàng Bảo Ngọc', studentCount: 37, roomNumber: 'P.04' },
  { id: 'c_8g1', name: '8G1', grade: 8, campusId: 'hau_loc', homeroomTeacher: 'Nguyễn Thị Oanh', monitorName: 'Đỗ Tuấn Khang', studentCount: 41, roomNumber: 'P.05' },
  { id: 'c_8g2', name: '8G2', grade: 8, campusId: 'hau_loc', homeroomTeacher: 'Lê Hữu Trung', monitorName: 'Nguyễn Kiều Trang', studentCount: 42, roomNumber: 'P.06' },
  { id: 'c_8g3', name: '8G3', grade: 8, campusId: 'hau_loc', homeroomTeacher: 'Bùi Thị Hồng', monitorName: 'Trần Văn Huy', studentCount: 38, roomNumber: 'P.07' },
  { id: 'c_9g1', name: '9G1', grade: 9, campusId: 'hau_loc', homeroomTeacher: 'Phan Văn Bình', monitorName: 'Vũ Minh Tuấn', studentCount: 43, roomNumber: 'P.08' },
  { id: 'c_9g2', name: '9G2', grade: 9, campusId: 'hau_loc', homeroomTeacher: 'Nguyễn Thị Dung', monitorName: 'Lê Thị Thu Trang', studentCount: 41, roomNumber: 'P.09' },
  { id: 'c_9g3', name: '9G3', grade: 9, campusId: 'hau_loc', homeroomTeacher: 'Tạ Minh Dũng', monitorName: 'Đặng Tuấn Anh', studentCount: 39, roomNumber: 'P.10' },

  // Lộc Tân (8 classes)
  { id: 'c_6e1', name: '6E1', grade: 6, campusId: 'loc_tan', homeroomTeacher: 'Hoàng Thị Thảo', monitorName: 'Lê Minh Hùng', studentCount: 36, roomNumber: 'P.01' },
  { id: 'c_6e2', name: '6E2', grade: 6, campusId: 'loc_tan', homeroomTeacher: 'Lê Bá Chiến', monitorName: 'Phạm Thanh Mai', studentCount: 37, roomNumber: 'P.02' },
  { id: 'c_7e1', name: '7E1', grade: 7, campusId: 'loc_tan', homeroomTeacher: 'Nguyễn Văn Phúc', monitorName: 'Trần Đình Trọng', studentCount: 38, roomNumber: 'P.03' },
  { id: 'c_7e2', name: '7E2', grade: 7, campusId: 'loc_tan', homeroomTeacher: 'Đỗ Thị Hạnh', monitorName: 'Vũ Thị Diệu', studentCount: 35, roomNumber: 'P.04' },
  { id: 'c_8e1', name: '8E1', grade: 8, campusId: 'loc_tan', homeroomTeacher: 'Trần Văn Tuyến', monitorName: 'Bùi Nhật Minh', studentCount: 39, roomNumber: 'P.05' },
  { id: 'c_8e2', name: '8E2', grade: 8, campusId: 'loc_tan', homeroomTeacher: 'Lê Thị Loan', monitorName: 'Nguyễn Hoàng Nam', studentCount: 40, roomNumber: 'P.06' },
  { id: 'c_9e1', name: '9E1', grade: 9, campusId: 'loc_tan', homeroomTeacher: 'Phạm Văn Nam', monitorName: 'Lê Thị Mai Anh', studentCount: 41, roomNumber: 'P.07' },
  { id: 'c_9e2', name: '9E2', grade: 9, campusId: 'loc_tan', homeroomTeacher: 'Vũ Thị Quyên', monitorName: 'Đỗ Thành Vinh', studentCount: 38, roomNumber: 'P.08' },

  // Lộc Sơn (8 classes)
  { id: 'c_6c1', name: '6C1', grade: 6, campusId: 'loc_son', homeroomTeacher: 'Nguyễn Thị Bích', monitorName: 'Trần Đăng Khoa', studentCount: 37, roomNumber: 'P.01' },
  { id: 'c_6c2', name: '6C2', grade: 6, campusId: 'loc_son', homeroomTeacher: 'Võ Minh Hải', monitorName: 'Lê Thuỳ Dung', studentCount: 38, roomNumber: 'P.02' },
  { id: 'c_7c1', name: '7C1', grade: 7, campusId: 'loc_son', homeroomTeacher: 'Lê Thị Nga', monitorName: 'Nguyễn Văn Hoàng', studentCount: 39, roomNumber: 'P.03' },
  { id: 'c_7c2', name: '7C2', grade: 7, campusId: 'loc_son', homeroomTeacher: 'Đinh Trọng Hào', monitorName: 'Phạm Quỳnh Nga', studentCount: 36, roomNumber: 'P.04' },
  { id: 'c_8c1', name: '8C1', grade: 8, campusId: 'loc_son', homeroomTeacher: 'Bùi Thị Lan', monitorName: 'Hoàng Đức Minh', studentCount: 40, roomNumber: 'P.05' },
  { id: 'c_8c2', name: '8C2', grade: 8, campusId: 'loc_son', homeroomTeacher: 'Trần Hữu Thắng', monitorName: 'Vũ Thuỳ Linh', studentCount: 38, roomNumber: 'P.06' },
  { id: 'c_9c1', name: '9C1', grade: 9, campusId: 'loc_son', homeroomTeacher: 'Phan Thị Hòa', monitorName: 'Lê Đình Khang', studentCount: 42, roomNumber: 'P.07' },
  { id: 'c_9c2', name: '9C2', grade: 9, campusId: 'loc_son', homeroomTeacher: 'Nguyễn Văn Đạt', monitorName: 'Trương Ngọc Ánh', studentCount: 41, roomNumber: 'P.08' },

  // Mỹ Lộc (8 classes)
  { id: 'c_6d1', name: '6D1', grade: 6, campusId: 'my_loc', homeroomTeacher: 'Đỗ Thị Huệ', monitorName: 'Nguyễn Thái Sơn', studentCount: 36, roomNumber: 'P.01' },
  { id: 'c_6d2', name: '6D2', grade: 6, campusId: 'my_loc', homeroomTeacher: 'Lê Văn Khiêm', monitorName: 'Trần Bích Phương', studentCount: 37, roomNumber: 'P.02' },
  { id: 'c_7d1', name: '7D1', grade: 7, campusId: 'my_loc', homeroomTeacher: 'Hoàng Thị Phượng', monitorName: 'Vũ Đức Trí', studentCount: 38, roomNumber: 'P.03' },
  { id: 'c_7d2', name: '7D2', grade: 7, campusId: 'my_loc', homeroomTeacher: 'Trần Văn Cảnh', monitorName: 'Lê Hải Yến', studentCount: 35, roomNumber: 'P.04' },
  { id: 'c_8d1', name: '8D1', grade: 8, campusId: 'my_loc', homeroomTeacher: 'Phạm Thị Thắm', monitorName: 'Nguyễn Gia Huy', studentCount: 39, roomNumber: 'P.05' },
  { id: 'c_8d2', name: '8D2', grade: 8, campusId: 'my_loc', homeroomTeacher: 'Vũ Văn Hào', monitorName: 'Đặng Ngọc Huyền', studentCount: 40, roomNumber: 'P.06' },
  { id: 'c_9d1', name: '9D1', grade: 9, campusId: 'my_loc', homeroomTeacher: 'Nguyễn Thị Lương', monitorName: 'Phan Minh Hoàng', studentCount: 41, roomNumber: 'P.07' },
  { id: 'c_9d2', name: '9D2', grade: 9, campusId: 'my_loc', homeroomTeacher: 'Lê Đình Trung', monitorName: 'Bùi Phương Ly', studentCount: 38, roomNumber: 'P.08' },

  // Thuần Lộc (12 classes)
  { id: 'c_6b1', name: '6B1', grade: 6, campusId: 'thuan_loc', homeroomTeacher: 'Nguyễn Thị Mai Lan', monitorName: 'Lê Bảo Nam', studentCount: 41, roomNumber: 'P.01' },
  { id: 'c_6b2', name: '6B2', grade: 6, campusId: 'thuan_loc', homeroomTeacher: 'Trần Đình Hiếu', monitorName: 'Vũ Hà My', studentCount: 40, roomNumber: 'P.02' },
  { id: 'c_6b3', name: '6B3', grade: 6, campusId: 'thuan_loc', homeroomTeacher: 'Lê Thị Phương', monitorName: 'Nguyễn Tấn Đạt', studentCount: 39, roomNumber: 'P.03' },
  { id: 'c_7b1', name: '7B1', grade: 7, campusId: 'thuan_loc', homeroomTeacher: 'Phạm Văn Khánh', monitorName: 'Đặng Thảo Vy', studentCount: 42, roomNumber: 'P.04' },
  { id: 'c_7b2', name: '7B2', grade: 7, campusId: 'thuan_loc', homeroomTeacher: 'Vũ Thị Thúy', monitorName: 'Hoàng Anh Dũng', studentCount: 40, roomNumber: 'P.05' },
  { id: 'c_7b3', name: '7B3', grade: 7, campusId: 'thuan_loc', homeroomTeacher: 'Bùi Văn Hưng', monitorName: 'Trịnh Mai Hương', studentCount: 38, roomNumber: 'P.06' },
  { id: 'c_8b1', name: '8B1', grade: 8, campusId: 'thuan_loc', homeroomTeacher: 'Đỗ Thị Tuyết', monitorName: 'Phan Quốc Bảo', studentCount: 43, roomNumber: 'P.07' },
  { id: 'c_8b2', name: '8B2', grade: 8, campusId: 'thuan_loc', homeroomTeacher: 'Nguyễn Bá Long', monitorName: 'Lê Cẩm Tú', studentCount: 41, roomNumber: 'P.08' },
  { id: 'c_8b3', name: '8B3', grade: 8, campusId: 'thuan_loc', homeroomTeacher: 'Lê Thị Hải', monitorName: 'Trần Mạnh Cường', studentCount: 39, roomNumber: 'P.09' },
  { id: 'c_9b1', name: '9B1', grade: 9, campusId: 'thuan_loc', homeroomTeacher: 'Vũ Văn Quyết', monitorName: 'Nguyễn Thành Long', studentCount: 44, roomNumber: 'P.10' },
  { id: 'c_9b2', name: '9B2', grade: 9, campusId: 'thuan_loc', homeroomTeacher: 'Trịnh Thị Liên', monitorName: 'Đinh Quỳnh Chi', studentCount: 42, roomNumber: 'P.11' },
  { id: 'c_9b3', name: '9B3', grade: 9, campusId: 'thuan_loc', homeroomTeacher: 'Hoàng Văn Lộc', monitorName: 'Bùi Anh Tuấn', studentCount: 40, roomNumber: 'P.12' },
];

// Official criteria strictly from the PDF document
export const INITIAL_CRITERIA: Criteria[] = OFFICIAL_CRITERIA_DATABASE;

export const INITIAL_USERS: User[] = [
  {
    id: 'u_admin',
    name: 'Thầy Nguyễn Văn Sơn',
    role: 'super_admin',
    email: 'nguyenvanson.hieutruong@lehuulap.edu.vn',
    title: 'Hiệu trưởng nhà trường / Quản trị tối cao',
  },
  {
    id: 'u_bgh',
    name: 'Thầy Hoàng Văn Sơn',
    role: 'bgh',
    email: 'hoangvanson.phohieutruong@lehuulap.edu.vn',
    title: 'Phó Hiệu trưởng phụ trách Thi đua & Khen thưởng',
  },
  {
    id: 'u_lead_hl',
    name: 'Cô Phạm Thị Mai',
    role: 'campus_admin',
    campusId: 'hau_loc',
    email: 'mai.hl@lehuulap.edu.vn',
    title: 'Quản trị viên Phân hiệu Hậu Lộc',
  },
  {
    id: 'u_lead_tl',
    name: 'Cô Trần Bích Ngọc',
    role: 'campus_admin',
    campusId: 'thuan_loc',
    email: 'ngoc.tl@lehuulap.edu.vn',
    title: 'Quản trị viên Phân hiệu Thuần Lộc',
  },
  {
    id: 'u_inspector',
    name: 'Cô Lê Thị Hoa',
    role: 'tpt_doi',
    email: 'lethihoa.tpt@lehuulap.edu.vn',
    title: 'Tổng Phụ Trách Đội & Trưởng ban Giám thị',
  },
  {
    id: 'u_teacher_9a1',
    name: 'Cô Lê Thị Nga',
    role: 'gvcn',
    campusId: 'lhl_main',
    classId: 'c_9a1',
    email: 'nga.gvcn9a1@lehuulap.edu.vn',
    title: 'Giáo viên Chủ nhiệm lớp 9A1',
  },
  {
    id: 'u_teacher_6g1',
    name: 'Thầy Đặng Thanh Tâm',
    role: 'gvcn',
    campusId: 'hau_loc',
    classId: 'c_6g1',
    email: 'tam.gvcn6g1@lehuulap.edu.vn',
    title: 'Giáo viên Chủ nhiệm lớp 6G1',
  },
  {
    id: 'u_redflag_long',
    name: 'Em Trịnh Hoàng Long',
    role: 'red_flag',
    campusId: 'lhl_main',
    classId: 'c_9a1',
    dutyDays: ['Thứ 2', 'Thứ 4', 'Thứ 6'],
    dutyArea: 'Khu phòng học dãy nhà A và sân cờ trung tâm',
    email: 'long.codo9a1@lehuulap.edu.vn',
    title: 'Đội trưởng Cờ Đỏ trực nhật Tuần 4',
  },
  {
    id: 'u_guest',
    name: 'Bác Trần Văn Hùng (Đại diện CMHS)',
    role: 'viewer',
    email: 'cmhs@lehuulap.edu.vn',
    title: 'Ban đại diện Cha mẹ học sinh (Chỉ xem báo cáo)',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit_init_01',
    timestamp: '2026-09-22T17:00:00.000Z',
    userId: 'u_admin',
    userName: 'Thầy Nguyễn Văn Sơn',
    userRole: 'super_admin',
    action: 'CHOT_DU_LIEU_TUAN',
    entityType: 'week_lock',
    entityId: 'week_3',
    beforeData: { lockedWeeks: [1, 2], weekLocked: false },
    afterData: { lockedWeeks: [1, 2, 3], weekLocked: true },
    details: 'Chốt khóa dữ liệu thi đua tuần 3 toàn trường theo kết luận giao ban tuần.',
  },
  {
    id: 'audit_init_02',
    timestamp: '2026-09-22T15:30:00.000Z',
    userId: 'u_inspector',
    userName: 'Cô Lê Thị Hoa',
    userRole: 'tpt_doi',
    action: 'DUYET_DIEU_CHINH',
    entityType: 'appeal',
    entityId: 'appeal_init_01',
    campusId: 'lhl_main',
    classId: 'c_9a1',
    beforeData: { status: 'pending' },
    afterData: { status: 'approved', reviewNotes: 'Đã xác minh học sinh có giấy phép của BGH tham gia đội tuyển HSG' },
    details: 'Chấp thuận đề nghị điều chỉnh điểm trừ vi phạm đồng phục lớp 9A1 Tuần 4.',
  },
  {
    id: 'audit_init_03',
    timestamp: '2026-09-22T08:15:00.000Z',
    userId: 'u_redflag_long',
    userName: 'Em Trịnh Hoàng Long',
    userRole: 'red_flag',
    action: 'THEM_DIEM',
    entityType: 'score_log',
    entityId: 'log_seed_sample_1',
    campusId: 'lhl_main',
    classId: 'c_9a2',
    beforeData: null,
    afterData: { points: -1, criteria: 'Đi muộn không phép' },
    details: 'Chấm vi phạm trực ban: Lớp 9A2 có 1 học sinh đi muộn giờ chào cờ đầu tuần (-1đ).',
  },
  {
    id: 'audit_init_04',
    timestamp: '2026-09-21T10:00:00.000Z',
    userId: 'u_admin',
    userName: 'Thầy Nguyễn Văn Sơn',
    userRole: 'super_admin',
    action: 'CAP_NHAT_CAU_HINH',
    entityType: 'settings',
    entityId: 'settings_global',
    beforeData: { totalClasses: 58 },
    afterData: { totalClasses: 59 },
    details: 'Cập nhật cấu hình chuẩn 6 Phân hiệu và 59 lớp học năm học 2026 - 2027.',
  },
];

export const INITIAL_APPEALS: AdjustmentAppeal[] = [
  {
    id: 'appeal_init_01',
    createdAt: '2026-09-22T14:00:00.000Z',
    classId: 'c_9a1',
    className: '9A1',
    campusId: 'lhl_main',
    campusName: 'Lê Hữu Lập – Trường chính',
    teacherId: 'u_teacher_9a1',
    teacherName: 'Cô Lê Thị Nga',
    week: 4,
    appealType: 'remove_penalty',
    criteriaName: 'Tác phong - Trang phục',
    reason: 'Học sinh Nguyễn Văn An sáng thứ 2 đi tập bồi dưỡng HSG cấp tỉnh nên mặc đồng phục dự tuyển, đội cờ đỏ ghi lỗi không đeo khăn quàng.',
    evidenceNotes: 'Đã có danh sách xác nhận của giáo viên phụ trách đội tuyển môn Toán.',
    proposedPoints: 1.0,
    status: 'approved',
    reviewerId: 'u_inspector',
    reviewerName: 'Cô Lê Thị Hoa',
    reviewedAt: '2026-09-22T15:30:00.000Z',
    reviewNotes: 'Đã kiểm tra danh sách HSG và hủy bỏ điểm trừ vi phạm cho lớp 9A1.',
  },
  {
    id: 'appeal_init_02',
    createdAt: '2026-09-22T16:20:00.000Z',
    classId: 'c_6g1',
    className: '6G1',
    campusId: 'hau_loc',
    campusName: 'Hậu Lộc',
    teacherId: 'u_teacher_6g1',
    teacherName: 'Thầy Đặng Thanh Tâm',
    week: 4,
    appealType: 'add_bonus',
    criteriaName: 'Lao động, vệ sinh',
    reason: 'Chi đội 6G1 tự nguyện ở lại dọn sạch cỏ và quét dọn khu vực cổng trường phụ sau giờ tan học.',
    evidenceNotes: 'Bác bảo vệ phân hiệu Hậu Lộc đã ký nhận biên bản lúc 17h15.',
    proposedPoints: 1.0,
    status: 'pending',
  },
];

// Helper to generate seed logs for weeks 1..4 based directly on the PDF criteria
function generateOfficialSeedLogs(): ScoreLog[] {
  const logs: ScoreLog[] = [];
  const classes = INITIAL_CLASSES;
  const campuses = INITIAL_CAMPUSES;
  const days = ['2026-09-07', '2026-09-08', '2026-09-09', '2026-09-10', '2026-09-11', '2026-09-12'];

  let logId = 1;

  for (let week = 1; week <= 4; week++) {
    classes.forEach((cls, index) => {
      const campus = campuses.find((c) => c.id === cls.campusId) || campuses[0];
      const isMain = campus.type === 'main';
      const isA1 = cls.name.endsWith('A1');
      const isA2A3 = cls.name.endsWith('A2') || cls.name.endsWith('A3');
      const seed = (index * 11 + week * 17) % 29;

      // 1. Sổ đầu bài ghi ký đầy đủ (+3đ) - TC_TT_01
      if (seed % 4 !== 0) {
        const crit = INITIAL_CRITERIA.find((c) => c.id === 'crit_tt_01')!;
        logs.push({
          id: `log_${logId++}`,
          week,
          month: 9,
          semester: 1,
          period: 'week',
          classId: cls.id,
          className: cls.name,
          campusId: cls.campusId,
          campusName: campus.name,
          campusType: campus.type,
          grade: cls.grade,
          criteriaId: crit.id,
          criteriaCode: crit.code,
          criteriaName: crit.name,
          category: crit.category,
          type: crit.type,
          pointsPerUnit: crit.points,
          quantity: 1,
          totalPoints: 3,
          calculationDetail: '1 tuần x 3đ = 3đ',
          note: 'Sổ đầu bài các tiết ghi, ký đầy đủ đúng quy định',
          date: days[5],
          recordedBy: 'Đội cờ đỏ',
          inspectorName: 'Đội Cờ đỏ Khối',
        });
      }

      // 2. Điểm tốt học tập tuần:
      // - Lớp A1 trường chính cần 13 con điểm tốt (+2đ) - crit_tt_03
      // - Lớp A2, A3 trường chính cần 10 con điểm tốt (+2đ) - crit_tt_04
      // - Các phân hiệu cần 5 con điểm tốt (+2đ) - crit_tt_02
      if (isMain) {
        if (isA1) {
          const goodQty = seed % 3 === 0 ? 14 : 11; // If 14: >=13 -> +2đ; If 11: <13 -> 0đ
          const crit = INITIAL_CRITERIA.find((c) => c.id === 'crit_tt_03')!;
          const calc = calculateCriteriaPoints(crit, goodQty, cls, campus);
          if (calc.totalPoints > 0) {
            logs.push({
              id: `log_${logId++}`,
              week,
              month: 9,
              semester: 1,
              period: 'week',
              classId: cls.id,
              className: cls.name,
              campusId: cls.campusId,
              campusName: campus.name,
              campusType: campus.type,
              grade: cls.grade,
              criteriaId: crit.id,
              criteriaCode: crit.code,
              criteriaName: crit.name,
              category: crit.category,
              type: crit.type,
              pointsPerUnit: crit.points,
              quantity: goodQty,
              totalPoints: calc.totalPoints,
              appliedCap: calc.appliedCap,
              calculationDetail: calc.calculationDetail,
              note: `Đạt ${goodQty} con điểm tốt 9-10 (Định mức lớp A1: 13)`,
              date: days[4],
              recordedBy: 'Giám thị',
              inspectorName: 'Cô Lê Thị Hoa',
            });
          }
        } else if (isA2A3) {
          const goodQty = seed % 3 !== 1 ? 11 : 8; // If 11: >=10 -> +2đ
          const crit = INITIAL_CRITERIA.find((c) => c.id === 'crit_tt_04')!;
          const calc = calculateCriteriaPoints(crit, goodQty, cls, campus);
          if (calc.totalPoints > 0) {
            logs.push({
              id: `log_${logId++}`,
              week,
              month: 9,
              semester: 1,
              period: 'week',
              classId: cls.id,
              className: cls.name,
              campusId: cls.campusId,
              campusName: campus.name,
              campusType: campus.type,
              grade: cls.grade,
              criteriaId: crit.id,
              criteriaCode: crit.code,
              criteriaName: crit.name,
              category: crit.category,
              type: crit.type,
              pointsPerUnit: crit.points,
              quantity: goodQty,
              totalPoints: calc.totalPoints,
              appliedCap: calc.appliedCap,
              calculationDetail: calc.calculationDetail,
              note: `Đạt ${goodQty} con điểm tốt (Định mức lớp A2/A3: 10)`,
              date: days[4],
              recordedBy: 'Giám thị',
              inspectorName: 'Cô Lê Thị Hoa',
            });
          }
        }
      } else {
        // Phân hiệu: cần 5 con điểm tốt
        const goodQty = seed % 2 === 0 ? 6 : 4; // If 6: >=5 -> +2đ
        const crit = INITIAL_CRITERIA.find((c) => c.id === 'crit_tt_02')!;
        const calc = calculateCriteriaPoints(crit, goodQty, cls, campus);
        if (calc.totalPoints > 0) {
          logs.push({
            id: `log_${logId++}`,
            week,
            month: 9,
            semester: 1,
            period: 'week',
            classId: cls.id,
            className: cls.name,
            campusId: cls.campusId,
            campusName: campus.name,
            campusType: campus.type,
            grade: cls.grade,
            criteriaId: crit.id,
            criteriaCode: crit.code,
            criteriaName: crit.name,
            category: crit.category,
            type: crit.type,
            pointsPerUnit: crit.points,
            quantity: goodQty,
            totalPoints: calc.totalPoints,
            appliedCap: calc.appliedCap,
            calculationDetail: calc.calculationDetail,
            note: `Đạt ${goodQty} con điểm tốt (Định mức phân hiệu: 5)`,
            date: days[4],
            recordedBy: 'Đội cờ đỏ',
            inspectorName: 'Đội Cờ đỏ Phân hiệu',
          });
        }
      }

      // 3. Điểm yếu học tập:
      // - Trường chính: 2 con điểm yếu trừ 1đ, thêm 1 con trừ thêm 0.5đ (crit_ht_04)
      // - Phân hiệu: 5 con điểm yếu trở lên trừ 2đ (trừ không quá 2đ) (crit_ht_03)
      if (isMain && seed % 5 === 2) {
        const weakCount = seed === 2 ? 3 : 2; // 2 con -> -1đ; 3 con -> -1.5đ
        const crit = INITIAL_CRITERIA.find((c) => c.id === 'crit_ht_04')!;
        const calc = calculateCriteriaPoints(crit, weakCount, cls, campus);
        logs.push({
          id: `log_${logId++}`,
          week,
          month: 9,
          semester: 1,
          period: 'week',
          classId: cls.id,
          className: cls.name,
          campusId: cls.campusId,
          campusName: campus.name,
          campusType: campus.type,
          grade: cls.grade,
          criteriaId: crit.id,
          criteriaCode: crit.code,
          criteriaName: crit.name,
          category: crit.category,
          type: crit.type,
          pointsPerUnit: crit.points,
          quantity: weakCount,
          totalPoints: calc.totalPoints,
          calculationDetail: calc.calculationDetail,
          note: `Ghi nhận ${weakCount} con điểm yếu trong tuần`,
          date: days[3],
          recordedBy: 'Giáo viên bộ môn',
          inspectorName: 'Kiểm tra sổ điểm',
        });
      } else if (!isMain && seed % 7 === 3) {
        const weakCount = 6; // >= 5 con -> -2đ (cap 2đ)
        const crit = INITIAL_CRITERIA.find((c) => c.id === 'crit_ht_03')!;
        const calc = calculateCriteriaPoints(crit, weakCount, cls, campus);
        logs.push({
          id: `log_${logId++}`,
          week,
          month: 9,
          semester: 1,
          period: 'week',
          classId: cls.id,
          className: cls.name,
          campusId: cls.campusId,
          campusName: campus.name,
          campusType: campus.type,
          grade: cls.grade,
          criteriaId: crit.id,
          criteriaCode: crit.code,
          criteriaName: crit.name,
          category: crit.category,
          type: crit.type,
          pointsPerUnit: crit.points,
          quantity: weakCount,
          totalPoints: calc.totalPoints,
          appliedCap: calc.appliedCap,
          calculationDetail: calc.calculationDetail,
          note: `Ghi nhận ${weakCount} con điểm yếu (Định mức phân hiệu ≥ 5)`,
          date: days[3],
          recordedBy: 'Giáo viên bộ môn',
          inspectorName: 'Kiểm tra sổ điểm',
        });
      }

      // 4. Minor weekly violations from official criteria
      if (seed % 4 === 1) {
        const crit = INITIAL_CRITERIA.find((c) => c.id === 'crit_tp_02')!; // Không sơ vin
        logs.push({
          id: `log_${logId++}`,
          week,
          month: 9,
          semester: 1,
          period: 'week',
          classId: cls.id,
          className: cls.name,
          campusId: cls.campusId,
          campusName: campus.name,
          campusType: campus.type,
          grade: cls.grade,
          criteriaId: crit.id,
          criteriaCode: crit.code,
          criteriaName: crit.name,
          category: crit.category,
          type: crit.type,
          pointsPerUnit: crit.points,
          quantity: 1,
          totalPoints: -1,
          calculationDetail: '1 lần x 1đ = 1đ',
          note: '1 học sinh không sơ vin đầu giờ',
          date: days[1],
          recordedBy: 'Đội cờ đỏ',
          inspectorName: 'Nguyễn Văn Minh',
        });
      }

      if (seed % 6 === 1) {
        const crit = INITIAL_CRITERIA.find((c) => c.id === 'crit_vs_02')!; // Trực nhật muộn
        logs.push({
          id: `log_${logId++}`,
          week,
          month: 9,
          semester: 1,
          period: 'week',
          classId: cls.id,
          className: cls.name,
          campusId: cls.campusId,
          campusName: campus.name,
          campusType: campus.type,
          grade: cls.grade,
          criteriaId: crit.id,
          criteriaCode: crit.code,
          criteriaName: crit.name,
          category: crit.category,
          type: crit.type,
          pointsPerUnit: crit.points,
          quantity: 1,
          totalPoints: -1,
          calculationDetail: '1 lần x 1đ = 1đ',
          note: 'Trực nhật muộn sau khi trống vào học đã điểm',
          date: days[2],
          recordedBy: 'Giám thị',
          inspectorName: 'Thầy Hoàng Văn Sơn',
        });
      }

      // 5. Bán trú - chỉ trường chính (Lần 2 trừ 1đ/HS, lần 3 trừ 3đ/HS)
      if (isMain && week === 3 && cls.name === '6A3') {
        const crit = INITIAL_CRITERIA.find((c) => c.id === 'crit_bt_02')!;
        logs.push({
          id: `log_${logId++}`,
          week: 3,
          month: 9,
          semester: 1,
          period: 'week',
          classId: cls.id,
          className: cls.name,
          campusId: cls.campusId,
          campusName: campus.name,
          campusType: campus.type,
          grade: cls.grade,
          criteriaId: crit.id,
          criteriaCode: crit.code,
          criteriaName: crit.name,
          category: crit.category,
          type: crit.type,
          pointsPerUnit: crit.points,
          quantity: 1,
          totalPoints: -1,
          calculationDetail: '1 HS x 1đ = -1đ',
          note: 'Vi phạm giờ ngủ trưa bán trú lần 2',
          date: '2026-09-17',
          recordedBy: 'Ban QL Bán trú',
          inspectorName: 'Cô Lê Thị Bích',
        });
      }

      // 6. Nhặt được của rơi (CR01: +0.5đ)
      if (week === 4 && (cls.name === '7A1' || cls.name === '8B1')) {
        const crit = INITIAL_CRITERIA.find((c) => c.id === 'crit_cr_01')!;
        logs.push({
          id: `log_${logId++}`,
          week: 4,
          month: 9,
          semester: 1,
          period: 'week',
          classId: cls.id,
          className: cls.name,
          campusId: cls.campusId,
          campusName: campus.name,
          campusType: campus.type,
          grade: cls.grade,
          criteriaId: crit.id,
          criteriaCode: crit.code,
          criteriaName: crit.name,
          category: crit.category,
          type: crit.type,
          pointsPerUnit: crit.points,
          quantity: 1,
          totalPoints: 0.5,
          calculationDetail: '1 lần x 0.5đ = 0.5đ',
          note: 'HS nhặt được ví tiền 350.000đ trả lại bạn',
          date: '2026-09-21',
          recordedBy: 'Tổng Phụ Trách',
          inspectorName: 'Cô Lê Thị Hoa',
        });
      }
    });
  }

  // Monthly Bonuses/Penalties (Month 9)
  // Giải nhất phong trào (+4đ) cho 9A1
  const class9A1 = classes.find((c) => c.name === '9A1')!;
  const critFirstPrize = INITIAL_CRITERIA.find((c) => c.id === 'crit_pt_01')!;
  logs.push({
    id: `log_${logId++}`,
    week: 4,
    month: 9,
    semester: 1,
    period: 'month',
    classId: class9A1.id,
    className: class9A1.name,
    campusId: class9A1.campusId,
    campusName: 'Lê Hữu Lập – Trường chính',
    campusType: 'main',
    grade: 9,
    criteriaId: critFirstPrize.id,
    criteriaCode: critFirstPrize.code,
    criteriaName: critFirstPrize.name,
    category: critFirstPrize.category,
    type: critFirstPrize.type,
    pointsPerUnit: critFirstPrize.points,
    quantity: 1,
    totalPoints: 4,
    calculationDetail: '1 giải Nhất x 4đ = +4đ vào điểm tháng',
    note: 'Đạt Giải Nhất Hội thi Kể chuyện Bác Hồ cấp trường tháng 9',
    date: '2026-09-22',
    recordedBy: 'Ban Giám Hiệu',
    inspectorName: 'Thầy Nguyễn Văn Sơn',
  });

  // Giải nhì phong trào (+3đ) cho 9B1 (Thuần Lộc)
  const class9B1 = classes.find((c) => c.name === '9B1')!;
  const critSecondPrize = INITIAL_CRITERIA.find((c) => c.id === 'crit_pt_02')!;
  logs.push({
    id: `log_${logId++}`,
    week: 4,
    month: 9,
    semester: 1,
    period: 'month',
    classId: class9B1.id,
    className: class9B1.name,
    campusId: class9B1.campusId,
    campusName: 'Thuần Lộc',
    campusType: 'sub',
    grade: 9,
    criteriaId: critSecondPrize.id,
    criteriaCode: critSecondPrize.code,
    criteriaName: critSecondPrize.name,
    category: critSecondPrize.category,
    type: critSecondPrize.type,
    pointsPerUnit: critSecondPrize.points,
    quantity: 1,
    totalPoints: 3,
    calculationDetail: '1 giải Nhì x 3đ = +3đ vào điểm tháng',
    note: 'Đạt Giải Nhì Hội thi Kể chuyện Bác Hồ cấp trường tháng 9',
    date: '2026-09-22',
    recordedBy: 'Ban Giám Hiệu',
    inspectorName: 'Thầy Nguyễn Văn Sơn',
  });

  // Vi phạm quy chế thi (-2đ vào điểm tháng) cho 8A3
  const class8A3 = classes.find((c) => c.name === '8A3')!;
  const critExamViolate = INITIAL_CRITERIA.find((c) => c.id === 'crit_qc_01')!;
  logs.push({
    id: `log_${logId++}`,
    week: 4,
    month: 9,
    semester: 1,
    period: 'month',
    classId: class8A3.id,
    className: class8A3.name,
    campusId: class8A3.campusId,
    campusName: 'Lê Hữu Lập – Trường chính',
    campusType: 'main',
    grade: 8,
    criteriaId: critExamViolate.id,
    criteriaCode: critExamViolate.code,
    criteriaName: critExamViolate.name,
    category: critExamViolate.category,
    type: critExamViolate.type,
    pointsPerUnit: critExamViolate.points,
    quantity: 1,
    totalPoints: -2,
    calculationDetail: '1 HS vi phạm quy chế thi x 2đ = -2đ (trừ vào điểm tháng)',
    note: '1 HS mang tài liệu trái phép trong bài kiểm tra định kỳ',
    date: '2026-09-20',
    recordedBy: 'Ban Khảo thí',
    inspectorName: 'Thầy Vũ Đức Nam',
  });

  // Yearly Bonus (Cộng điểm cả năm)
  // Lớp 9A1: HS tham gia đội tuyển tỉnh đạt >90% giải (+5đ) - TG05
  const critProvincial = INITIAL_CRITERIA.find((c) => c.id === 'crit_tg_05')!;
  logs.push({
    id: `log_${logId++}`,
    week: 4,
    period: 'year',
    classId: class9A1.id,
    className: class9A1.name,
    campusId: class9A1.campusId,
    campusName: 'Lê Hữu Lập – Trường chính',
    campusType: 'main',
    grade: 9,
    criteriaId: critProvincial.id,
    criteriaCode: critProvincial.code,
    criteriaName: critProvincial.name,
    category: critProvincial.category,
    type: critProvincial.type,
    pointsPerUnit: critProvincial.points,
    quantity: 1,
    totalPoints: 5,
    calculationDetail: 'Đội tuyển HSG tỉnh Khối 9 đạt trên 90% giải = +5đ vào điểm cả năm',
    note: 'Đội tuyển HSG Toán & Lý cấp tỉnh đạt 92% giải',
    date: '2026-09-22',
    recordedBy: 'Hiệu trưởng',
    inspectorName: 'Thầy Nguyễn Văn Sơn',
  });

  // Lớp 7A1: Đội nghi lễ Liên đội (3 em x 0.1đ = +0.3đ, cap 0.5đ) - TG06
  const class7A1 = classes.find((c) => c.name === '7A1')!;
  const critCeremony = INITIAL_CRITERIA.find((c) => c.id === 'crit_tg_06')!;
  logs.push({
    id: `log_${logId++}`,
    week: 4,
    period: 'year',
    classId: class7A1.id,
    className: class7A1.name,
    campusId: class7A1.campusId,
    campusName: 'Lê Hữu Lập – Trường chính',
    campusType: 'main',
    grade: 7,
    criteriaId: critCeremony.id,
    criteriaCode: critCeremony.code,
    criteriaName: critCeremony.name,
    category: critCeremony.category,
    type: critCeremony.type,
    pointsPerUnit: critCeremony.points,
    quantity: 3,
    totalPoints: 0.3,
    appliedCap: 0.5,
    calculationDetail: '3 em x 0.1đ = +0.3đ (Tối đa 0.5đ/lớp)',
    note: '3 học sinh tham gia đội trống nghi lễ Liên đội',
    date: '2026-09-22',
    recordedBy: 'Tổng Phụ Trách',
    inspectorName: 'Cô Lê Thị Hoa',
  });

  // Kỷ luật: 1 lớp vi phạm bị hội đồng kỷ luật xử lý -> Không xếp loại cả năm
  // Ví dụ 8G3 phân hiệu Hậu Lộc: HV03 (Hút thuốc lá điện tử)
  const class8G3 = classes.find((c) => c.name === '8G3')!;
  const critDisciplinary = INITIAL_CRITERIA.find((c) => c.id === 'crit_hv_03')!;
  logs.push({
    id: `log_${logId++}`,
    week: 3,
    month: 9,
    semester: 1,
    period: 'week',
    classId: class8G3.id,
    className: class8G3.name,
    campusId: class8G3.campusId,
    campusName: 'Hậu Lộc',
    campusType: 'sub',
    grade: 8,
    criteriaId: critDisciplinary.id,
    criteriaCode: critDisciplinary.code,
    criteriaName: critDisciplinary.name,
    category: critDisciplinary.category,
    type: critDisciplinary.type,
    pointsPerUnit: critDisciplinary.points,
    quantity: 1,
    totalPoints: -10,
    calculationDetail: '1 HS x 10đ = -10đ (Kỷ luật toàn trường)',
    note: 'Học sinh vi phạm hút thuốc lá điện tử, Hội đồng kỷ luật nhà trường xử lý',
    date: '2026-09-18',
    recordedBy: 'Hội đồng kỷ luật',
    inspectorName: 'Hội đồng kỷ luật trường',
    isDisciplinary: true,
  });

  return logs;
}

export const INITIAL_SCORE_LOGS: ScoreLog[] = generateOfficialSeedLogs();

export const INITIAL_RED_FLAG_DUTIES: RedFlagDuty[] = [
  {
    id: 'duty_1',
    week: 4,
    campusId: 'lhl_main',
    dayOfWeek: 'Thứ 2',
    assignedClassId: 'c_9a1',
    assignedClassName: '9A1',
    inspectorNames: 'Nguyễn Khánh Linh, Trịnh Hoàng Long',
    dutyArea: 'Khu lớp học Khối 6, Khối 7 & Cổng trường',
    notes: 'Kiểm tra trang phục đầu tuần (áo sơ mi trắng sơ vin, khăn quàng đỏ) và trật tự cổng trường.',
    createdAt: '2026-09-21',
  },
  {
    id: 'duty_2',
    week: 4,
    campusId: 'lhl_main',
    dayOfWeek: 'Thứ 3',
    assignedClassId: 'c_9a2',
    assignedClassName: '9A2',
    inspectorNames: 'Lê Đình Quang, Nguyễn Thảo Nguyên',
    dutyArea: 'Khu vệ sinh chung & Hành lang các tầng',
    notes: 'Giám sát 15 phút đầu giờ truy bài và vệ sinh lớp học.',
    createdAt: '2026-09-21',
  },
  {
    id: 'duty_3',
    week: 4,
    campusId: 'lhl_main',
    dayOfWeek: 'Thứ 4',
    assignedClassId: 'c_8a1',
    assignedClassName: '8A1',
    inspectorNames: 'Vũ Hải Đăng, Phạm Minh Đức',
    dutyArea: 'Sân bóng rổ, Thể dục & Nhà để xe',
    notes: 'Kiểm tra nề nếp tập thể dục giữa giờ và sắp xếp xe học sinh ngay ngắn.',
    createdAt: '2026-09-21',
  },
  {
    id: 'duty_4',
    week: 4,
    campusId: 'hau_loc',
    dayOfWeek: 'Thứ 2',
    assignedClassId: 'c_9g1',
    assignedClassName: '9G1',
    inspectorNames: 'Lê Thị Thu Trang, Vũ Minh Tuấn',
    dutyArea: 'Cổng phân hiệu Hậu Lộc & Khu lớp 6, 7',
    notes: 'Kiểm tra chuyên cần, sĩ số và sơ vin đầu tuần.',
    createdAt: '2026-09-21',
  },
  {
    id: 'duty_5',
    week: 4,
    campusId: 'loc_tan',
    dayOfWeek: 'Thứ 2',
    assignedClassId: 'c_9e1',
    assignedClassName: '9E1',
    inspectorNames: 'Bùi Nhật Minh, Lê Thị Mai Anh',
    dutyArea: 'Toàn bộ khuôn viên phân hiệu Lộc Tân',
    notes: 'Trực cờ đỏ giờ truy bài, tác phong khăn quàng và giữ gìn của công.',
    createdAt: '2026-09-21',
  },
  {
    id: 'duty_6',
    week: 4,
    campusId: 'thuan_loc',
    dayOfWeek: 'Thứ 2',
    assignedClassId: 'c_9b1',
    assignedClassName: '9B1',
    inspectorNames: 'Nguyễn Văn Nam, Trần Thị Hương',
    dutyArea: 'Cổng phân hiệu & Dãy phòng học Khối 6, 7, 8',
    notes: 'Kiểm tra vệ sinh đầu giờ và nề nếp đồng phục.',
    createdAt: '2026-09-21',
  },
];
