import { User, RoleType, ViewTab, ClassItem, Campus, ScoreLog, normalizeRole } from '../types';

/**
 * RBAC Permission Control Engine for THCS Lê Hữu Lập
 * 
 * Roles:
 * 1. super_admin: Toàn quyền toàn hệ thống.
 * 2. bgh: Ban Giám Hiệu (Xem toàn trường, duyệt và chốt dữ liệu, xem báo cáo, xem audit log).
 * 3. campus_admin: Quản trị viên phân hiệu (Chỉ quản lý phân hiệu được phân công).
 * 4. tpt_doi: TPT Đội / Phụ trách Đội (Nhập và quản lý dữ liệu thi đua của phân hiệu được giao, duyệt phản hồi).
 * 5. gvcn: Giáo viên chủ nhiệm (Chỉ xem lớp mình phụ trách, gửi phản hồi/đề nghị điều chỉnh).
 * 6. red_flag: Đội cờ đỏ (Chỉ được nhập dữ liệu theo nhiệm vụ trực ban).
 * 7. viewer: Người xem (Chỉ được xem báo cáo/xếp hạng).
 */

export function getUserRole(user?: User | null): RoleType {
  if (!user) return 'viewer';
  return normalizeRole(user.role);
}

/** Check if user can access a navigation tab */
export function canAccessTab(user: User, tab: ViewTab): boolean {
  const role = getUserRole(user);

  switch (tab) {
    case 'dashboard':
    case 'rankings':
    case 'reports':
    case 'criteria':
      // Public / all roles can view
      return true;

    case 'campuses':
      // Super Admin, BGH, Campus Admin, TPT Đội
      return ['super_admin', 'bgh', 'campus_admin', 'tpt_doi'].includes(role);

    case 'classes':
      // Super Admin, BGH, Campus Admin, TPT Đội, GVCN (GVCN sees own class)
      return ['super_admin', 'bgh', 'campus_admin', 'tpt_doi', 'gvcn'].includes(role);

    case 'redflag':
      // Super Admin, BGH, Campus Admin, TPT Đội, Red Flag
      return ['super_admin', 'bgh', 'campus_admin', 'tpt_doi', 'red_flag'].includes(role);

    case 'scoring':
      // Super Admin, Campus Admin, TPT Đội, Red Flag
      // (BGH does NOT enter scores directly; GVCN and Viewer do NOT enter scores)
      return ['super_admin', 'campus_admin', 'tpt_doi', 'red_flag'].includes(role);

    case 'datalock':
      // ONLY Super Admin and BGH
      return ['super_admin', 'bgh'].includes(role);

    case 'appeals':
      // GVCN submits appeals; Super Admin, BGH, TPT Đội, Campus Admin review
      return ['super_admin', 'bgh', 'campus_admin', 'tpt_doi', 'gvcn'].includes(role);

    case 'audit_logs':
      // ONLY Super Admin and BGH
      return ['super_admin', 'bgh'].includes(role);

    case 'users':
      // Super Admin and BGH (BGH can view/search accounts; Super Admin can edit/create)
      return ['super_admin', 'bgh'].includes(role);

    case 'settings':
      // ONLY Super Admin
      return role === 'super_admin';

    default:
      return true;
  }
}

/** Check if user has permission to lock or unlock weekly data */
export function canLockUnlockWeeks(user: User): boolean {
  const role = getUserRole(user);
  return role === 'super_admin' || role === 'bgh';
}

/** Check if user can view audit logs */
export function canViewAuditLogs(user: User): boolean {
  const role = getUserRole(user);
  return role === 'super_admin' || role === 'bgh';
}

/** Check if user can manage users */
export function canManageUsers(user: User): boolean {
  const role = getUserRole(user);
  return role === 'super_admin';
}

/** Check if user can configure school settings */
export function canConfigureSettings(user: User): boolean {
  const role = getUserRole(user);
  return role === 'super_admin';
}

/** Check if user can submit adjustment appeal (GVCN) */
export function canSubmitAppeal(user: User, classId?: string): boolean {
  const role = getUserRole(user);
  if (role === 'super_admin') return true;
  if (role === 'gvcn') {
    if (!classId || !user.classId) return true;
    return user.classId === classId;
  }
  return false;
}

/** Check if user can review / approve adjustment appeals */
export function canReviewAppeals(user: User, appealCampusId?: string): boolean {
  const role = getUserRole(user);
  if (role === 'super_admin' || role === 'bgh') return true;
  if (role === 'tpt_doi') return true;
  if (role === 'campus_admin') {
    if (!appealCampusId || !user.campusId) return true;
    return user.campusId === appealCampusId;
  }
  return false;
}

/** Check if user can input scores for a target campus and class in a specific week */
export function canInputScores(
  user: User,
  targetCampusId: string,
  targetClassId?: string,
  week?: number,
  lockedWeeks: number[] = []
): { allowed: boolean; reason?: string } {
  // Check week lock first
  if (week !== undefined && lockedWeeks.includes(week)) {
    return {
      allowed: false,
      reason: `Tuần ${week} đã được Ban Giám Hiệu khóa chốt dữ liệu thi đua. Không thể nhập hoặc chỉnh sửa điểm.`,
    };
  }

  const role = getUserRole(user);

  switch (role) {
    case 'super_admin':
      return { allowed: true };

    case 'bgh':
      return {
        allowed: false,
        reason: 'Ban Giám Hiệu có thẩm quyền xem xét, phê duyệt và chốt dữ liệu, không trực tiếp chấm điểm thi đua.',
      };

    case 'campus_admin':
      if (user.campusId && user.campusId !== targetCampusId) {
        return {
          allowed: false,
          reason: 'Quản trị viên phân hiệu chỉ có quyền quản lý và nhập điểm cho phân hiệu được phân công.',
        };
      }
      return { allowed: true };

    case 'tpt_doi':
      if (user.campusId && user.campusId !== targetCampusId) {
        return {
          allowed: false,
          reason: 'Tổng phụ trách chỉ được giao quản lý phân hiệu được phân công phụ trách.',
        };
      }
      return { allowed: true };

    case 'red_flag':
      // Red flag members are allowed to record duties
      return { allowed: true };

    case 'gvcn':
      return {
        allowed: false,
        reason: 'Giáo viên chủ nhiệm không trực tiếp nhập điểm thi đua của lớp. Vui lòng gửi Phản hồi / Đề nghị điều chỉnh ở mục Khiếu nại.',
      };

    case 'viewer':
    default:
      return {
        allowed: false,
        reason: 'Tài khoản Người xem chỉ có quyền xem báo cáo, không được phép nhập điểm.',
      };
  }
}

/** Check if user can manage campus/class metadata (add, edit, delete) */
export function canManageCampusClasses(user: User, targetCampusId?: string): boolean {
  const role = getUserRole(user);
  if (role === 'super_admin') return true;
  if (role === 'campus_admin') {
    if (!targetCampusId) return true;
    return user.campusId === targetCampusId;
  }
  return false;
}

/** Scope classes visible to user */
export function filterVisibleClasses(classes: ClassItem[], user: User): ClassItem[] {
  const role = getUserRole(user);
  if (role === 'gvcn' && user.classId) {
    return classes.filter((c) => c.id === user.classId);
  }
  if (role === 'campus_admin' && user.campusId) {
    return classes.filter((c) => c.campusId === user.campusId);
  }
  return classes;
}

/** Scope campuses visible to user */
export function filterVisibleCampuses(campuses: Campus[], user: User): Campus[] {
  const role = getUserRole(user);
  if (role === 'campus_admin' && user.campusId) {
    return campuses.filter((c) => c.id === user.campusId);
  }
  return campuses;
}

/** Scope score logs visible to user */
export function filterVisibleScoreLogs(logs: ScoreLog[], user: User): ScoreLog[] {
  const role = getUserRole(user);
  if (role === 'gvcn' && user.classId) {
    return logs.filter((l) => l.classId === user.classId);
  }
  if (role === 'campus_admin' && user.campusId) {
    return logs.filter((l) => l.campusId === user.campusId);
  }
  return logs;
}

export interface RoleMetadataItem {
  id: RoleType;
  name: string;
  badgeColor: string;
  description: string;
  level: number;
}

export const ROLE_METADATA: Record<string, RoleMetadataItem> = {
  super_admin: {
    id: 'super_admin',
    name: '1. Super Admin',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    description: 'Toàn quyền toàn hệ thống (Cấu hình, phân quyền, quản lý dữ liệu, kiểm toán).',
    level: 1,
  },
  admin: {
    id: 'super_admin',
    name: '1. Super Admin',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    description: 'Toàn quyền toàn hệ thống (Cấu hình, phân quyền, quản lý dữ liệu, kiểm toán).',
    level: 1,
  },
  bgh: {
    id: 'bgh',
    name: '2. Ban Giám Hiệu',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    description: 'Xem toàn trường, duyệt và chốt dữ liệu, xem báo cáo và kiểm toán.',
    level: 2,
  },
  campus_admin: {
    id: 'campus_admin',
    name: '3. QTV Phân hiệu',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'Chỉ quản lý phân hiệu được phân công (Quản lý lớp, duyệt đề nghị, xem thi đua).',
    level: 3,
  },
  campus_lead: {
    id: 'campus_admin',
    name: '3. QTV Phân hiệu',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'Chỉ quản lý phân hiệu được phân công (Quản lý lớp, duyệt đề nghị, xem thi đua).',
    level: 3,
  },
  tpt_doi: {
    id: 'tpt_doi',
    name: '4. TPT Đội / Phụ trách Đội',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    description: 'Nhập và quản lý dữ liệu thi đua của phân hiệu được giao, duyệt điều chỉnh điểm.',
    level: 4,
  },
  inspector: {
    id: 'tpt_doi',
    name: '4. TPT Đội / Phụ trách Đội',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    description: 'Nhập và quản lý dữ liệu thi đua của phân hiệu được giao, duyệt điều chỉnh điểm.',
    level: 4,
  },
  gvcn: {
    id: 'gvcn',
    name: '5. Giáo viên Chủ nhiệm',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'Chỉ xem lớp mình phụ trách, có thể gửi phản hồi hoặc đề nghị điều chỉnh điểm.',
    level: 5,
  },
  teacher: {
    id: 'gvcn',
    name: '5. Giáo viên Chủ nhiệm',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'Chỉ xem lớp mình phụ trách, có thể gửi phản hồi hoặc đề nghị điều chỉnh điểm.',
    level: 5,
  },
  red_flag: {
    id: 'red_flag',
    name: '6. Đội Cờ đỏ',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    description: 'Chỉ được nhập dữ liệu theo nhiệm vụ trực tuần được phân công.',
    level: 6,
  },
  viewer: {
    id: 'viewer',
    name: '7. Người xem',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
    description: 'Chỉ được xem báo cáo và bảng xếp loại thi đua, không chỉnh sửa dữ liệu.',
    level: 7,
  },
  public: {
    id: 'viewer',
    name: '7. Người xem',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
    description: 'Chỉ được xem báo cáo và bảng xếp loại thi đua, không chỉnh sửa dữ liệu.',
    level: 7,
  },
};
