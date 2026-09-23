import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Campus,
  ClassItem,
  Criteria,
  SchoolSettings,
  ScoreLog,
  User,
  ViewTab,
  ClassWeeklyScore,
  RankingEntry,
  CriteriaPeriod,
  RedFlagDuty,
  AuditLog,
  AdjustmentAppeal,
  RoleType,
  normalizeRole,
  AcademicYearArchive,
  SystemFullBackupPayload,
} from '../types';
import {
  exportOfflineStandbyEvaluationBook,
  exportRankingsToExcel,
  exportScoreLogsToExcel,
  exportCriteriaCatalogToExcel,
} from '../utils/excelExporter';
import {
  INITIAL_CAMPUSES,
  INITIAL_CLASSES,
  INITIAL_CRITERIA,
  INITIAL_SCORE_LOGS,
  INITIAL_SETTINGS,
  INITIAL_USERS,
  INITIAL_RED_FLAG_DUTIES,
  INITIAL_AUDIT_LOGS,
  INITIAL_APPEALS,
} from '../data/initialData';
import {
  calculateCriteriaPoints,
  isCriteriaApplicableForClass,
  getMonthForWeek,
  getSemesterForWeek,
  DEFAULT_EVALUATION_CONFIG,
} from '../utils/criteriaEngine';
import {
  getUserRole,
  canAccessTab as checkCanAccessTab,
  canLockUnlockWeeks,
  canViewAuditLogs,
  canManageUsers,
  canConfigureSettings,
  canSubmitAppeal,
  canReviewAppeals,
  canInputScores,
  canManageCampusClasses,
  filterVisibleClasses,
  filterVisibleCampuses,
  filterVisibleScoreLogs,
} from '../utils/rbac';

export interface CalculationPreviewResult {
  applicable: boolean;
  reason?: string;
  pointsPerUnit: number;
  totalPoints: number;
  appliedCap?: number;
  calculationDetail: string;
  isDisciplinary: boolean;
  period: CriteriaPeriod;
  targetClass?: ClassItem;
  campus?: Campus;
  criteria?: Criteria;
}

interface AppContextType {
  campuses: Campus[];
  classes: ClassItem[];
  criteria: Criteria[];
  scoreLogs: ScoreLog[];
  settings: SchoolSettings;
  users: User[];
  currentUser: User;
  currentTab: ViewTab;
  selectedCampusId: string;
  selectedGrade: number | 'all';
  selectedWeek: number;
  selectedMonth: number;
  selectedSemester: 1 | 2;

  // RBAC & Scope state
  userRole: RoleType;
  canAccessTab: (tab: ViewTab) => boolean;
  visibleClasses: ClassItem[];
  visibleCampuses: Campus[];
  visibleScoreLogs: ScoreLog[];

  // Audit Logs (Mọi thao tác thêm, sửa, xóa, chốt dữ liệu)
  auditLogs: AuditLog[];
  logAudit: (entry: Omit<AuditLog, 'id' | 'timestamp' | 'userId' | 'userName' | 'userRole'>) => void;

  // Feedback & Adjustment Appeals (GVCN gửi đề nghị điều chỉnh, BGH/TPT duyệt)
  appeals: AdjustmentAppeal[];
  submitAppeal: (appeal: Omit<AdjustmentAppeal, 'id' | 'createdAt' | 'status' | 'teacherId' | 'teacherName'>) => { success: boolean; message: string };
  reviewAppeal: (id: string, status: 'approved' | 'rejected', reviewNotes?: string, adjustScore?: boolean) => { success: boolean; message: string };

  // Setters
  setCurrentTab: (tab: ViewTab) => void;
  setSelectedCampusId: (id: string) => void;
  setSelectedGrade: (grade: number | 'all') => void;
  setSelectedWeek: (week: number) => void;
  setSelectedMonth: (month: number) => void;
  setSelectedSemester: (sem: 1 | 2) => void;
  switchCurrentUser: (userId: string) => void;

  // CRUD Users
  addUser: (user: Omit<User, 'id'>) => { success: boolean; message?: string };
  updateUser: (id: string, patch: Partial<User>) => { success: boolean; message?: string };
  deleteUser: (id: string) => { success: boolean; message?: string };

  // CRUD Campuses
  addCampus: (campus: Omit<Campus, 'id'>) => { success: boolean; message?: string };
  updateCampus: (id: string, campus: Partial<Campus>) => { success: boolean; message?: string };
  deleteCampus: (id: string) => { success: boolean; message?: string };

  // CRUD Classes
  addClass: (item: Omit<ClassItem, 'id'>) => { success: boolean; message?: string };
  updateClass: (id: string, item: Partial<ClassItem>) => { success: boolean; message?: string };
  deleteClass: (id: string) => { success: boolean; message?: string };

  // CRUD Criteria
  addCriteria: (crit: Omit<Criteria, 'id'>) => void;
  updateCriteria: (id: string, crit: Partial<Criteria>) => void;
  deleteCriteria: (id: string) => void;
  toggleCriteriaActive: (id: string) => void;

  // CRUD Score Logs
  addScoreLog: (log: Omit<ScoreLog, 'id'>) => { success: boolean; message?: string };
  updateScoreLog: (id: string, log: Partial<ScoreLog>) => { success: boolean; message?: string };
  deleteScoreLog: (id: string) => { success: boolean; message?: string };
  bulkAddScoreLogs: (logs: Omit<ScoreLog, 'id'>[]) => { success: boolean; count: number; message?: string };

  // Red Flag Duties & Week Locking
  redFlagDuties: RedFlagDuty[];
  lockedWeeks: number[];
  isWeekLocked: (week: number) => boolean;
  toggleLockWeek: (week: number) => { success: boolean; isLocked: boolean; message: string };
  addRedFlagDuty: (duty: Omit<RedFlagDuty, 'id'>) => void;
  updateRedFlagDuty: (id: string, duty: Partial<RedFlagDuty>) => void;
  deleteRedFlagDuty: (id: string) => void;

  // Engine Preview Helper
  previewCriteriaCalculation: (
    criteriaId: string,
    quantity: number,
    classId: string
  ) => CalculationPreviewResult;

  // Settings, Multi-Year & Full Backup
  updateSettings: (newSettings: Partial<SchoolSettings>) => { success: boolean; message?: string };
  resetToDefaultData: () => void;
  exportDataBackup: () => string;
  importDataBackup: (jsonStr: string) => { success: boolean; message: string };

  // Multi-Year Academic Year Management
  academicYearArchives: AcademicYearArchive[];
  switchAcademicYear: (year: string) => { success: boolean; message: string };
  createNewAcademicYear: (
    newYear: string,
    options: { advanceGrades?: boolean; archiveCurrentYear?: boolean; resetScores?: boolean; note?: string }
  ) => { success: boolean; message: string };
  deleteArchivedYear: (archiveId: string) => { success: boolean; message: string };

  // System Integrity & Regulation Compliance Audit
  runSystemIntegrityAudit: () => {
    isCompliant: boolean;
    issues: string[];
    passedChecks: string[];
    totalClasses: number;
    totalCampuses: number;
    checkedAt: string;
  };

  // Stand-alone Excel Exports (Offline-Ready)
  exportOfflineStandbyWorkbook: (week?: number) => void;
  exportCurrentRankingsExcel: (periodType?: 'week' | 'month' | 'semester' | 'year', scopeTitle?: string) => void;
  exportCurrentScoreLogsExcel: (filterDesc?: string) => void;
  exportCriteriaCatalogExcel: () => void;
  exportFullBackupPayload: () => string;
  restoreFullBackup: (payload: SystemFullBackupPayload) => { success: boolean; message: string };

  // Calculation & Ranking Engine
  getClassWeeklyScore: (classId: string, week: number) => ClassWeeklyScore;
  getWeeklyRankings: (week: number, campusId?: string, grade?: number | 'all') => RankingEntry[];
  getMonthlyRankings: (month: number, campusId?: string, grade?: number | 'all') => RankingEntry[];
  getSemesterRankings: (semester: 1 | 2, campusId?: string, grade?: number | 'all') => RankingEntry[];
  getYearlyRankings: (campusId?: string, grade?: number | 'all') => RankingEntry[];
  getSchoolStats: (week: number) => {
    avgScore: number;
    highestScore: number;
    lowestScore: number;
    totalBonusPoints: number;
    totalPenaltyPoints: number;
    totalViolations: number;
    totalHonors: number;
    topClass: RankingEntry | null;
    topCampus: { campus: Campus; avgScore: number } | null;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CAMPUSES: 'lhl_ranking_campuses_v2',
  CLASSES: 'lhl_ranking_classes_v2',
  CRITERIA: 'lhl_ranking_criteria_v2',
  SCORE_LOGS: 'lhl_ranking_score_logs_v2',
  SETTINGS: 'lhl_ranking_settings_v2',
  USERS: 'lhl_ranking_users_v2',
  CURRENT_USER_ID: 'lhl_ranking_current_user_id_v2',
  RED_FLAG_DUTIES: 'lhl_ranking_red_flag_duties_v2',
  LOCKED_WEEKS: 'lhl_ranking_locked_weeks_v2',
  AUDIT_LOGS: 'lhl_ranking_audit_logs_v2',
  APPEALS: 'lhl_ranking_appeals_v2',
  ACADEMIC_ARCHIVES: 'lhl_ranking_academic_archives_v2',
};

function determineTier(score: number): RankingEntry['performanceTier'] {
  if (score >= 105) return 'Xuất sắc';
  if (score >= 95) return 'Tốt';
  if (score >= 85) return 'Khá';
  if (score >= 70) return 'Trung bình';
  return 'Cần cố gắng';
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Core State with LocalStorage fallbacks and schema upgrade checks
  const [campuses, setCampuses] = useState<Campus[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CAMPUSES);
      if (raw) return JSON.parse(raw);
    } catch {}
    return INITIAL_CAMPUSES;
  });

  const [classes, setClasses] = useState<ClassItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CLASSES);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If stored classes are fewer than INITIAL_CLASSES (e.g. 58 vs 59), merge missing classes
          if (parsed.length < INITIAL_CLASSES.length) {
            const existingIds = new Set(parsed.map((c: ClassItem) => c.id));
            const missing = INITIAL_CLASSES.filter((c) => !existingIds.has(c.id));
            if (missing.length > 0) {
              const updated = [...parsed, ...missing];
              try {
                localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(updated));
              } catch {}
              return updated;
            }
          }
          return parsed;
        }
      }
    } catch {}
    return INITIAL_CLASSES;
  });

  const [criteria, setCriteria] = useState<Criteria[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CRITERIA);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length >= 25 && parsed[0].period) {
          return parsed;
        }
      }
    } catch {}
    return INITIAL_CRITERIA;
  });

  const [scoreLogs, setScoreLogs] = useState<ScoreLog[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SCORE_LOGS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].period) {
          return parsed;
        }
      }
    } catch {}
    return INITIAL_SCORE_LOGS;
  });

  const [settings, setSettings] = useState<SchoolSettings>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.evaluationConfig) {
          return parsed;
        }
        return {
          ...INITIAL_SETTINGS,
          ...parsed,
          evaluationConfig: DEFAULT_EVALUATION_CONFIG,
        };
      }
    } catch {}
    return INITIAL_SETTINGS;
  });

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USERS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Synchronize official school principal (Thầy Nguyễn Văn Sơn) and youth union leader (Cô Lê Thị Hoa)
          const updated = parsed.map((u: User) => {
            if (u.id === 'u_admin' || u.role === 'admin') {
              return {
                ...u,
                name: 'Thầy Nguyễn Văn Sơn',
                title: 'Hiệu trưởng nhà trường / Quản trị hệ thống',
                email: 'nguyenvanson.hieutruong@lehuulap.edu.vn',
              };
            }
            if (u.id === 'u_inspector' || u.title?.includes('Tổng Phụ Trách')) {
              return {
                ...u,
                name: 'Cô Lê Thị Hoa',
                title: 'Tổng Phụ Trách Đội & Trưởng ban Giám thị',
                email: 'lethihoa.tpt@lehuulap.edu.vn',
              };
            }
            return u;
          });
          try {
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
          } catch {}
          return updated;
        }
      }
    } catch {}
    return INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      if (raw) return raw;
    } catch {}
    return 'u_admin';
  });

  const [redFlagDuties, setRedFlagDuties] = useState<RedFlagDuty[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.RED_FLAG_DUTIES);
      if (raw) return JSON.parse(raw);
    } catch {}
    return INITIAL_RED_FLAG_DUTIES;
  });

  const [lockedWeeks, setLockedWeeks] = useState<number[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LOCKED_WEEKS);
      if (raw) return JSON.parse(raw);
    } catch {}
    return settings.lockedWeeks || [1, 2, 3];
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (raw) return JSON.parse(raw);
    } catch {}
    return INITIAL_AUDIT_LOGS;
  });

  const [appeals, setAppeals] = useState<AdjustmentAppeal[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.APPEALS);
      if (raw) return JSON.parse(raw);
    } catch {}
    return INITIAL_APPEALS;
  });

  const [academicYearArchives, setAcademicYearArchives] = useState<AcademicYearArchive[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ACADEMIC_ARCHIVES);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });

  // 2. Navigation and Filter State
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  const [selectedCampusId, setSelectedCampusId] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<number | 'all'>('all');
  const [selectedWeek, setSelectedWeek] = useState<number>(4);
  const [selectedMonth, setSelectedMonth] = useState<number>(9);
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(1);

  // Derive Current User object & RBAC roles
  const currentUser = useMemo(() => {
    return users.find((u) => u.id === currentUserId) || users[0];
  }, [users, currentUserId]);

  const userRole = useMemo(() => getUserRole(currentUser), [currentUser]);

  const canAccessTab = (tab: ViewTab) => checkCanAccessTab(currentUser, tab);

  const visibleClasses = useMemo(() => filterVisibleClasses(classes, currentUser), [classes, currentUser]);
  const visibleCampuses = useMemo(() => filterVisibleCampuses(campuses, currentUser), [campuses, currentUser]);
  const visibleScoreLogs = useMemo(() => filterVisibleScoreLogs(scoreLogs, currentUser), [scoreLogs, currentUser]);

  // Persist State to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CAMPUSES, JSON.stringify(campuses));
    } catch {}
  }, [campuses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
    } catch {}
  }, [classes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CRITERIA, JSON.stringify(criteria));
    } catch {}
  }, [criteria]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SCORE_LOGS, JSON.stringify(scoreLogs));
    } catch {}
  }, [scoreLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch {}
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
    } catch {}
  }, [currentUserId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RED_FLAG_DUTIES, JSON.stringify(redFlagDuties));
    } catch {}
  }, [redFlagDuties]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOCKED_WEEKS, JSON.stringify(lockedWeeks));
    } catch {}
  }, [lockedWeeks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
    } catch {}
  }, [auditLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.APPEALS, JSON.stringify(appeals));
    } catch {}
  }, [appeals]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACADEMIC_ARCHIVES, JSON.stringify(academicYearArchives));
    } catch {}
  }, [academicYearArchives]);

  // Initial backend synchronization
  useEffect(() => {
    fetch('/api/audit-logs', {
      headers: {
        'x-user-id': currentUser.id,
        'x-user-name': currentUser.name,
        'x-user-role': userRole,
      },
    })
      .then((r) => r.json())
      .then((res) => {
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          setAuditLogs((prev) => {
            const ids = new Set(prev.map((p) => p.id));
            const newOnes = res.data.filter((item: AuditLog) => !ids.has(item.id));
            return [...prev, ...newOnes];
          });
        }
      })
      .catch(() => {});

    fetch('/api/appeals', {
      headers: {
        'x-user-id': currentUser.id,
        'x-user-name': currentUser.name,
        'x-user-role': userRole,
        'x-user-campus': currentUser.campusId || '',
        'x-user-class': currentUser.classId || '',
      },
    })
      .then((r) => r.json())
      .then((res) => {
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          setAppeals(res.data);
        }
      })
      .catch(() => {});
  }, [currentUser.id, userRole]);

  // Centralized Audit Logging Service
  const logAudit = (entry: Omit<AuditLog, 'id' | 'timestamp' | 'userId' | 'userName' | 'userRole'>) => {
    const role = getUserRole(currentUser);
    const newEntry: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: role,
      ...entry,
    };

    setAuditLogs((prev) => [newEntry, ...prev.slice(0, 1500)]);

    // Asynchronously sync with backend endpoint
    try {
      fetch('/api/audit-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-name': currentUser.name,
          'x-user-role': role,
          'x-user-campus': currentUser.campusId || '',
          'x-user-class': currentUser.classId || '',
        },
        body: JSON.stringify(newEntry),
      }).catch(() => {});
    } catch {}
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch {}
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
    } catch {}
  }, [currentUserId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RED_FLAG_DUTIES, JSON.stringify(redFlagDuties));
    } catch {}
  }, [redFlagDuties]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOCKED_WEEKS, JSON.stringify(lockedWeeks));
    } catch {}
  }, [lockedWeeks]);

  // 3. User & Auth actions
  const switchCurrentUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUserId(found.id);
      if (found.campusId) {
        setSelectedCampusId(found.campusId);
      }
    }
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    if (!canManageUsers(currentUser)) {
      return { success: false, message: 'Chỉ Super Admin mới có quyền tạo tài khoản người dùng!' };
    }
    const id = `u_${Date.now()}`;
    const newUser: User = { ...userData, id };
    setUsers((prev) => [...prev, newUser]);
    logAudit({
      action: 'THEM_NGUOI_DUNG',
      entityType: 'user',
      entityId: id,
      beforeData: null,
      afterData: newUser,
      details: `Thêm người dùng mới: ${newUser.name} (${newUser.title}) - Quyền: ${newUser.role}`,
    });
    return { success: true };
  };

  const updateUser = (id: string, patch: Partial<User>) => {
    if (!canManageUsers(currentUser)) {
      return { success: false, message: 'Chỉ Super Admin mới có quyền cập nhật tài khoản người dùng!' };
    }
    const oldUser = users.find((u) => u.id === id);
    if (!oldUser) return { success: false, message: 'Không tìm thấy người dùng' };
    const updated = { ...oldUser, ...patch };
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    logAudit({
      action: 'SUA_NGUOI_DUNG',
      entityType: 'user',
      entityId: id,
      beforeData: oldUser,
      afterData: updated,
      details: `Cập nhật thông tin người dùng: ${updated.name} (Quyền: ${updated.role})`,
    });
    return { success: true };
  };

  const deleteUser = (id: string) => {
    if (!canManageUsers(currentUser)) {
      return { success: false, message: 'Chỉ Super Admin mới có quyền xóa người dùng!' };
    }
    if (id === currentUser.id) {
      return { success: false, message: 'Không thể xóa tài khoản của chính mình đang đăng nhập!' };
    }
    const oldUser = users.find((u) => u.id === id);
    if (!oldUser) return { success: false, message: 'Không tìm thấy người dùng' };
    setUsers((prev) => prev.filter((u) => u.id !== id));
    logAudit({
      action: 'XOA_NGUOI_DUNG',
      entityType: 'user',
      entityId: id,
      beforeData: oldUser,
      afterData: null,
      details: `Xóa tài khoản người dùng: ${oldUser.name} (${oldUser.role})`,
    });
    return { success: true };
  };

  // 4. Campus CRUD
  const addCampus = (newCamp: Omit<Campus, 'id'>) => {
    if (!canManageCampusClasses(currentUser)) {
      return { success: false, message: 'Chỉ Super Admin mới có quyền thêm phân hiệu trường!' };
    }
    const id = `camp_${Date.now()}`;
    const campusItem: Campus = { ...newCamp, id };
    setCampuses((prev) => [...prev, campusItem]);
    logAudit({
      action: 'THEM_PHAN_HIEU',
      entityType: 'campus',
      entityId: id,
      beforeData: null,
      afterData: campusItem,
      details: `Thêm phân hiệu mới: ${campusItem.name} (${campusItem.type === 'main' ? 'Trường chính' : 'Điểm trường'})`,
    });
    return { success: true };
  };

  const updateCampus = (id: string, patch: Partial<Campus>) => {
    if (!canManageCampusClasses(currentUser, id)) {
      return { success: false, message: 'Bạn không có quyền chỉnh sửa phân hiệu này!' };
    }
    const oldCamp = campuses.find((c) => c.id === id);
    if (!oldCamp) return { success: false, message: 'Không tìm thấy phân hiệu' };
    const updated = { ...oldCamp, ...patch };
    setCampuses((prev) => prev.map((c) => (c.id === id ? updated : c)));
    logAudit({
      action: 'SUA_PHAN_HIEU',
      entityType: 'campus',
      entityId: id,
      beforeData: oldCamp,
      afterData: updated,
      details: `Cập nhật thông tin phân hiệu: ${updated.name}`,
    });
    return { success: true };
  };

  const deleteCampus = (id: string) => {
    if (!canManageCampusClasses(currentUser, id)) {
      return { success: false, message: 'Bạn không có quyền xóa phân hiệu này!' };
    }
    const hasClasses = classes.some((cls) => cls.campusId === id);
    if (hasClasses) {
      return {
        success: false,
        message: 'Không thể xóa phân hiệu đang có các lớp học trực thuộc. Vui lòng chuyển hoặc xóa các lớp trước.',
      };
    }
    const oldCamp = campuses.find((c) => c.id === id);
    setCampuses((prev) => prev.filter((c) => c.id !== id));
    if (oldCamp) {
      logAudit({
        action: 'XOA_PHAN_HIEU',
        entityType: 'campus',
        entityId: id,
        beforeData: oldCamp,
        afterData: null,
        details: `Xóa phân hiệu: ${oldCamp.name}`,
      });
    }
    return { success: true };
  };

  // 5. Class CRUD
  const addClass = (newItem: Omit<ClassItem, 'id'>) => {
    if (!canManageCampusClasses(currentUser, newItem.campusId)) {
      return { success: false, message: 'Bạn không có quyền thêm lớp học vào phân hiệu này!' };
    }
    const id = `cls_${Date.now()}`;
    const classItem: ClassItem = { ...newItem, id };
    setClasses((prev) => [...prev, classItem]);
    const camp = campuses.find((c) => c.id === classItem.campusId);
    logAudit({
      action: 'THEM_LOP',
      entityType: 'class',
      entityId: id,
      campusId: classItem.campusId,
      classId: id,
      beforeData: null,
      afterData: classItem,
      details: `Thêm lớp mới: Lớp ${classItem.name} (Khối ${classItem.grade}) thuộc ${camp?.name || 'Phân hiệu'} - GVCN: ${classItem.homeroomTeacher}`,
    });
    return { success: true };
  };

  const updateClass = (id: string, patch: Partial<ClassItem>) => {
    const oldClass = classes.find((c) => c.id === id);
    if (!oldClass || !canManageCampusClasses(currentUser, oldClass.campusId)) {
      return { success: false, message: 'Bạn không có quyền chỉnh sửa lớp học này!' };
    }
    const updated = { ...oldClass, ...patch };
    setClasses((prev) => prev.map((c) => (c.id === id ? updated : c)));
    logAudit({
      action: 'SUA_LOP',
      entityType: 'class',
      entityId: id,
      campusId: updated.campusId,
      classId: id,
      beforeData: oldClass,
      afterData: updated,
      details: `Cập nhật thông tin lớp: Lớp ${updated.name} - GVCN: ${updated.homeroomTeacher}`,
    });
    return { success: true };
  };

  const deleteClass = (id: string) => {
    const oldClass = classes.find((c) => c.id === id);
    if (!oldClass || !canManageCampusClasses(currentUser, oldClass.campusId)) {
      return { success: false, message: 'Bạn không có quyền xóa lớp học này!' };
    }
    setClasses((prev) => prev.filter((c) => c.id !== id));
    setScoreLogs((prev) => prev.filter((l) => l.classId !== id));
    logAudit({
      action: 'XOA_LOP',
      entityType: 'class',
      entityId: id,
      campusId: oldClass.campusId,
      classId: id,
      beforeData: oldClass,
      afterData: null,
      details: `Xóa lớp học: Lớp ${oldClass.name} (Khối ${oldClass.grade})`,
    });
    return { success: true };
  };

  // 6. Criteria CRUD
  const addCriteria = (crit: Omit<Criteria, 'id'>) => {
    const id = `crit_${Date.now()}`;
    const newCrit = { ...crit, id };
    setCriteria((prev) => [...prev, newCrit]);
    logAudit({
      action: 'CAP_NHAT_CAU_HINH',
      entityType: 'criteria',
      entityId: id,
      beforeData: null,
      afterData: newCrit,
      details: `Thêm tiêu chí thi đua mới: ${newCrit.code} - ${newCrit.name} (${newCrit.points}đ/${newCrit.unit})`,
    });
  };

  const updateCriteria = (id: string, patch: Partial<Criteria>) => {
    const oldCrit = criteria.find((c) => c.id === id);
    if (!oldCrit) return;
    const updated = { ...oldCrit, ...patch };
    setCriteria((prev) => prev.map((c) => (c.id === id ? updated : c)));
    logAudit({
      action: 'CAP_NHAT_CAU_HINH',
      entityType: 'criteria',
      entityId: id,
      beforeData: oldCrit,
      afterData: updated,
      details: `Cập nhật tiêu chí thi đua: ${updated.code} - ${updated.name}`,
    });
  };

  const deleteCriteria = (id: string) => {
    const oldCrit = criteria.find((c) => c.id === id);
    setCriteria((prev) => prev.filter((c) => c.id !== id));
    if (oldCrit) {
      logAudit({
        action: 'CAP_NHAT_CAU_HINH',
        entityType: 'criteria',
        entityId: id,
        beforeData: oldCrit,
        afterData: null,
        details: `Xóa tiêu chí thi đua: ${oldCrit.code} - ${oldCrit.name}`,
      });
    }
  };

  const toggleCriteriaActive = (id: string) => {
    const oldCrit = criteria.find((c) => c.id === id);
    setCriteria((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)));
    if (oldCrit) {
      logAudit({
        action: 'CAP_NHAT_CAU_HINH',
        entityType: 'criteria',
        entityId: id,
        beforeData: { isActive: oldCrit.isActive },
        afterData: { isActive: !oldCrit.isActive },
        details: `${!oldCrit.isActive ? 'Kích hoạt' : 'Tạm ngưng'} tiêu chí: ${oldCrit.code} - ${oldCrit.name}`,
      });
    }
  };

  // 7. Preview Calculation Helper
  const previewCriteriaCalculation = (
    criteriaId: string,
    quantity: number,
    classId: string
  ): CalculationPreviewResult => {
    const crit = criteria.find((c) => c.id === criteriaId);
    const targetClass = classes.find((c) => c.id === classId);

    if (!crit || !targetClass) {
      return {
        applicable: false,
        reason: 'Không tìm thấy thông tin tiêu chí hoặc lớp học',
        pointsPerUnit: 0,
        totalPoints: 0,
        calculationDetail: 'Dữ liệu không hợp lệ',
        isDisciplinary: false,
        period: 'week',
      };
    }

    const campus = campuses.find((c) => c.id === targetClass.campusId) || {
      id: targetClass.campusId,
      code: '???',
      name: 'Chưa rõ',
      type: 'sub',
      leaderName: '',
      phone: '',
      address: '',
      colorTheme: 'slate',
    };

    const applicability = isCriteriaApplicableForClass(crit, targetClass, campus);
    const calc = calculateCriteriaPoints(crit, quantity, targetClass, campus, settings.evaluationConfig);

    return {
      applicable: applicability.applicable,
      reason: applicability.reason,
      pointsPerUnit: calc.pointsPerUnit,
      totalPoints: calc.totalPoints,
      appliedCap: calc.appliedCap,
      calculationDetail: calc.calculationDetail,
      isDisciplinary: calc.isDisciplinary,
      period: crit.period,
      targetClass,
      campus,
      criteria: crit,
    };
  };

  // Helper to enrich a score log with complete criteria engine metadata
  const enrichScoreLog = (log: Omit<ScoreLog, 'id'>): Omit<ScoreLog, 'id'> => {
    const targetClass = classes.find((c) => c.id === log.classId);
    const targetCampus = targetClass
      ? campuses.find((c) => c.id === targetClass.campusId)
      : campuses.find((c) => c.id === log.campusId);
    const targetCriteria = criteria.find((c) => c.id === log.criteriaId);

    const period = log.period || targetCriteria?.period || 'week';
    const week = log.week || selectedWeek;
    const month = log.month || getMonthForWeek(week, settings.monthWeeksMap);
    const semester = log.semester || getSemesterForWeek(week);

    // If calculation details or points not provided, compute dynamically
    let totalPoints = log.totalPoints;
    let calculationDetail = log.calculationDetail;
    let appliedCap = log.appliedCap;
    let isDisciplinary = log.isDisciplinary ?? false;
    const pointsPerUnit = log.pointsPerUnit || targetCriteria?.points || 1;

    if (targetClass && targetCampus && targetCriteria) {
      const calc = calculateCriteriaPoints(
        targetCriteria,
        log.quantity,
        targetClass,
        targetCampus,
        settings.evaluationConfig
      );
      totalPoints = calc.totalPoints;
      calculationDetail = calc.calculationDetail;
      appliedCap = calc.appliedCap;
      if (calc.isDisciplinary) isDisciplinary = true;
    }

    return {
      ...log,
      week,
      month,
      semester,
      period,
      className: targetClass ? targetClass.name : log.className || 'Lớp ?',
      campusId: targetCampus ? targetCampus.id : log.campusId,
      campusName: targetCampus ? targetCampus.name : log.campusName || 'Phân hiệu ?',
      campusType: targetCampus ? targetCampus.type : log.campusType || 'sub',
      grade: targetClass ? targetClass.grade : log.grade || 6,
      criteriaCode: targetCriteria ? targetCriteria.code : log.criteriaCode || 'TC',
      criteriaName: targetCriteria ? targetCriteria.name : log.criteriaName || 'Tiêu chí',
      category: targetCriteria ? targetCriteria.category : log.category || 'Khác',
      type: targetCriteria ? targetCriteria.type : log.type || 'penalty',
      pointsPerUnit,
      totalPoints,
      appliedCap,
      calculationDetail,
      isDisciplinary,
    };
  };

  // 8. Score Log CRUD with RBAC & Audit Logging
  const isWeekLocked = (week: number): boolean => {
    return lockedWeeks.includes(week);
  };

  const toggleLockWeek = (week: number): { success: boolean; isLocked: boolean; message: string } => {
    if (!canLockUnlockWeeks(currentUser)) {
      return {
        success: false,
        isLocked: isWeekLocked(week),
        message: 'Quyền hạn bị từ chối: Chỉ Ban Giám Hiệu hoặc Super Admin mới có quyền duyệt và chốt khóa dữ liệu tuần!',
      };
    }

    const currentlyLocked = isWeekLocked(week);
    const beforeWeeks = [...lockedWeeks];
    let updated: number[];
    if (currentlyLocked) {
      updated = lockedWeeks.filter((w) => w !== week);
    } else {
      updated = [...lockedWeeks, week].sort((a, b) => a - b);
    }
    setLockedWeeks(updated);
    setSettings((prev) => ({ ...prev, lockedWeeks: updated }));

    // Record Audit Log with before and after
    logAudit({
      action: currentlyLocked ? 'MO_KHOA_TUAN' : 'CHOT_DU_LIEU_TUAN',
      entityType: 'week_lock',
      entityId: `week_${week}`,
      beforeData: { lockedWeeks: beforeWeeks, weekLocked: currentlyLocked },
      afterData: { lockedWeeks: updated, weekLocked: !currentlyLocked },
      details: `${!currentlyLocked ? 'Chốt khóa dữ liệu thi đua' : 'Mở khóa sửa đổi dữ liệu'} Tuần ${week} toàn trường`,
    });

    // Sync with backend API
    fetch('/api/datalock/toggle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': currentUser.id,
        'x-user-name': currentUser.name,
        'x-user-role': userRole,
      },
      body: JSON.stringify({ week }),
    }).catch(() => {});

    return {
      success: true,
      isLocked: !currentlyLocked,
      message: !currentlyLocked
        ? `Đã CHỐT SỐ LIỆU & KHÓA thành công Tuần ${week}. Toàn bộ điểm số tuần này được đóng băng.`
        : `Đã MỞ KHÓA Tuần ${week}. Giáo viên và Đội cờ đỏ có thể tiếp tục cập nhật điểm.`,
    };
  };

  const addRedFlagDuty = (duty: Omit<RedFlagDuty, 'id'>) => {
    const id = `duty_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newDuty = { ...duty, id, createdAt: new Date().toISOString().split('T')[0] };
    setRedFlagDuties((prev) => [newDuty, ...prev]);
    logAudit({
      action: 'PHAN_CONG_CO_DO',
      entityType: 'red_flag',
      entityId: id,
      campusId: duty.campusId,
      classId: duty.assignedClassId,
      beforeData: null,
      afterData: newDuty,
      details: `Phân công trực cờ đỏ: Lớp ${duty.assignedClassName} trực ${duty.dayOfWeek} tại ${duty.dutyArea}`,
    });
  };

  const updateRedFlagDuty = (id: string, patch: Partial<RedFlagDuty>) => {
    const oldDuty = redFlagDuties.find((d) => d.id === id);
    if (!oldDuty) return;
    const updated = { ...oldDuty, ...patch };
    setRedFlagDuties((prev) => prev.map((d) => (d.id === id ? updated : d)));
    logAudit({
      action: 'PHAN_CONG_CO_DO',
      entityType: 'red_flag',
      entityId: id,
      campusId: updated.campusId,
      classId: updated.assignedClassId,
      beforeData: oldDuty,
      afterData: updated,
      details: `Cập nhật phân công cờ đỏ: Lớp ${updated.assignedClassName} (${updated.dayOfWeek})`,
    });
  };

  const deleteRedFlagDuty = (id: string) => {
    const oldDuty = redFlagDuties.find((d) => d.id === id);
    setRedFlagDuties((prev) => prev.filter((d) => d.id !== id));
    if (oldDuty) {
      logAudit({
        action: 'XOA_LICH_CO_DO',
        entityType: 'red_flag',
        entityId: id,
        campusId: oldDuty.campusId,
        classId: oldDuty.assignedClassId,
        beforeData: oldDuty,
        afterData: null,
        details: `Hủy phân công trực cờ đỏ: Lớp ${oldDuty.assignedClassName} (${oldDuty.dayOfWeek})`,
      });
    }
  };

  const addScoreLog = (log: Omit<ScoreLog, 'id'>) => {
    const enriched = enrichScoreLog(log);
    const targetWeek = enriched.week;

    // RBAC validation
    const permission = canInputScores(currentUser, enriched.campusId, enriched.classId, targetWeek, lockedWeeks);
    if (!permission.allowed) {
      return { success: false, message: permission.reason };
    }

    const id = `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newLog: ScoreLog = { ...enriched, id };
    setScoreLogs((prev) => [newLog, ...prev]);

    // Record Audit Log with before and after
    logAudit({
      action: 'THEM_DIEM',
      entityType: 'score_log',
      entityId: id,
      campusId: enriched.campusId,
      classId: enriched.classId,
      beforeData: null,
      afterData: newLog,
      details: `Thêm biên bản thi đua lớp ${enriched.className} (${enriched.campusName}): ${enriched.criteriaName} (${enriched.totalPoints > 0 ? '+' : ''}${enriched.totalPoints}đ)`,
    });

    return { success: true };
  };

  const updateScoreLog = (id: string, patch: Partial<ScoreLog>) => {
    const oldLog = scoreLogs.find((l) => l.id === id);
    if (!oldLog) return { success: false, message: 'Không tìm thấy biên bản chấm điểm' };

    // RBAC check
    const permission = canInputScores(currentUser, oldLog.campusId, oldLog.classId, oldLog.week, lockedWeeks);
    if (!permission.allowed) {
      return { success: false, message: permission.reason };
    }

    const updated = { ...oldLog, ...patch };
    setScoreLogs((prev) => prev.map((l) => (l.id === id ? updated : l)));

    // Record Audit Log with before and after
    logAudit({
      action: 'SUA_DIEM',
      entityType: 'score_log',
      entityId: id,
      campusId: updated.campusId,
      classId: updated.classId,
      beforeData: oldLog,
      afterData: updated,
      details: `Chỉnh sửa biên bản thi đua lớp ${updated.className} (${updated.campusName}): ${updated.criteriaName} (${updated.totalPoints > 0 ? '+' : ''}${updated.totalPoints}đ)`,
    });

    return { success: true };
  };

  const deleteScoreLog = (id: string) => {
    const oldLog = scoreLogs.find((l) => l.id === id);
    if (!oldLog) return { success: false, message: 'Không tìm thấy biên bản chấm điểm' };

    // RBAC check
    const permission = canInputScores(currentUser, oldLog.campusId, oldLog.classId, oldLog.week, lockedWeeks);
    if (!permission.allowed) {
      return { success: false, message: permission.reason };
    }

    setScoreLogs((prev) => prev.filter((l) => l.id !== id));

    // Record Audit Log with before and after
    logAudit({
      action: 'XOA_DIEM',
      entityType: 'score_log',
      entityId: id,
      campusId: oldLog.campusId,
      classId: oldLog.classId,
      beforeData: oldLog,
      afterData: null,
      details: `Xóa biên bản thi đua lớp ${oldLog.className} (${oldLog.campusName}): ${oldLog.criteriaName} (${oldLog.totalPoints > 0 ? '+' : ''}${oldLog.totalPoints}đ)`,
    });

    return { success: true };
  };

  const bulkAddScoreLogs = (newLogs: Omit<ScoreLog, 'id'>[]) => {
    if (newLogs.length === 0) return { success: true, count: 0 };
    const firstWeek = newLogs[0].week || selectedWeek;
    if (isWeekLocked(firstWeek) && userRole !== 'super_admin') {
      return {
        success: false,
        count: 0,
        message: `Tuần ${firstWeek} đã được Ban Giám Hiệu chốt khóa dữ liệu. Không thể lưu vi phạm!`,
      };
    }

    const items: ScoreLog[] = newLogs.map((log, index) => ({
      ...enrichScoreLog(log),
      id: `log_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`,
    }));

    setScoreLogs((prev) => [...items, ...prev]);

    // Record Audit Log
    logAudit({
      action: 'THEM_DIEM',
      entityType: 'score_log',
      entityId: `batch_${Date.now()}`,
      beforeData: null,
      afterData: { count: items.length },
      details: `Nhập điểm thi đua đồng loạt cho ${items.length} lượt vi phạm/khen thưởng Tuần ${firstWeek}`,
    });

    return { success: true, count: items.length };
  };

  // Feedback & Adjustment Appeals (GVCN & BGH/TPT)
  const submitAppeal = (appealData: Omit<AdjustmentAppeal, 'id' | 'createdAt' | 'status' | 'teacherId' | 'teacherName'>) => {
    if (!canSubmitAppeal(currentUser, appealData.classId)) {
      return { success: false, message: 'Bạn chỉ có quyền gửi phản hồi/đề nghị điều chỉnh cho lớp mình làm chủ nhiệm!' };
    }

    const newAppeal: AdjustmentAppeal = {
      ...appealData,
      id: `appeal_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
      teacherId: currentUser.id,
      teacherName: currentUser.name,
    };

    setAppeals((prev) => [newAppeal, ...prev]);

    // Record Audit Log
    logAudit({
      action: 'GUI_DE_NGHI_DIEU_CHINH',
      entityType: 'appeal',
      entityId: newAppeal.id,
      campusId: newAppeal.campusId,
      classId: newAppeal.classId,
      beforeData: null,
      afterData: newAppeal,
      details: `GVCN ${currentUser.name} gửi phản hồi/đề nghị điều chỉnh điểm Tuần ${newAppeal.week} cho lớp ${newAppeal.className}: ${newAppeal.reason}`,
    });

    // Backend sync
    fetch('/api/appeals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': currentUser.id,
        'x-user-name': currentUser.name,
        'x-user-role': userRole,
      },
      body: JSON.stringify(newAppeal),
    }).catch(() => {});

    return { success: true, message: 'Đã gửi đề nghị điều chỉnh điểm tới Ban Giám Hiệu và TPT Đội xét duyệt.' };
  };

  const reviewAppeal = (id: string, status: 'approved' | 'rejected', reviewNotes?: string, adjustScore: boolean = true) => {
    const appeal = appeals.find((a) => a.id === id);
    if (!appeal) return { success: false, message: 'Không tìm thấy yêu cầu điều chỉnh' };

    if (!canReviewAppeals(currentUser, appeal.campusId)) {
      return { success: false, message: 'Bạn không có quyền duyệt yêu cầu điều chỉnh của phân hiệu này!' };
    }

    const beforeAppeal = { ...appeal };
    let resultingScoreLogId: string | undefined = undefined;

    // If approved and adjustScore is requested, automatically generate adjustment score log
    if (status === 'approved' && adjustScore) {
      const isBonus = appeal.appealType === 'add_bonus';
      const points = appeal.proposedPoints || (isBonus ? 1 : 1);
      const crit = criteria.find((c) => (isBonus ? c.type === 'bonus' : c.type === 'penalty')) || criteria[0];

      const adjLog: Omit<ScoreLog, 'id'> = {
        week: appeal.week,
        period: 'week',
        classId: appeal.classId,
        className: appeal.className,
        campusId: appeal.campusId,
        campusName: appeal.campusName,
        campusType: 'sub',
        grade: 6,
        criteriaId: crit.id,
        criteriaCode: 'DIEUCHINH',
        criteriaName: `[Điều chỉnh BGH] ${appeal.criteriaName || 'Phản hồi GVCN'}`,
        category: 'Học tập',
        type: isBonus ? 'bonus' : 'bonus',
        pointsPerUnit: points,
        quantity: 1,
        totalPoints: points,
        calculationDetail: `Duyệt đề nghị điều chỉnh của GVCN ${appeal.teacherName}: ${appeal.reason}`,
        note: `Căn cứ đề nghị điều chỉnh #${appeal.id}: ${reviewNotes || 'Hợp lệ'}`,
        date: new Date().toISOString().split('T')[0],
        recordedBy: currentUser.title || 'Ban Giám Hiệu',
        inspectorName: currentUser.name,
      };

      const enriched = enrichScoreLog(adjLog);
      resultingScoreLogId = `log_adj_${Date.now()}`;
      setScoreLogs((prev) => [{ ...enriched, id: resultingScoreLogId! }, ...prev]);
    }

    const updatedAppeal: AdjustmentAppeal = {
      ...appeal,
      status,
      reviewerId: currentUser.id,
      reviewerName: currentUser.name,
      reviewedAt: new Date().toISOString(),
      reviewNotes: reviewNotes || '',
      resultingScoreLogId,
    };

    setAppeals((prev) => prev.map((a) => (a.id === id ? updatedAppeal : a)));

    // Record Audit Log with before and after
    logAudit({
      action: status === 'approved' ? 'DUYET_DIEU_CHINH' : 'TU_CHOI_DIEU_CHINH',
      entityType: 'appeal',
      entityId: id,
      campusId: appeal.campusId,
      classId: appeal.classId,
      beforeData: beforeAppeal,
      afterData: updatedAppeal,
      details: `${status === 'approved' ? 'Phê duyệt chấp thuận' : 'Từ chối'} đề nghị điều chỉnh của lớp ${appeal.className} (Tuần ${appeal.week}). Phản hồi: ${reviewNotes || 'Không có'}`,
    });

    // Backend sync
    fetch(`/api/appeals/${id}/review`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': currentUser.id,
        'x-user-name': currentUser.name,
        'x-user-role': userRole,
      },
      body: JSON.stringify({ status, reviewNotes }),
    }).catch(() => {});

    return {
      success: true,
      message: status === 'approved' ? 'Đã phê duyệt đề nghị điều chỉnh điểm!' : 'Đã từ chối đề nghị điều chỉnh.',
    };
  };

  // 9. Settings & System Actions with Audit Logging
  const updateSettings = (newSettings: Partial<SchoolSettings>) => {
    if (!canConfigureSettings(currentUser)) {
      return { success: false, message: 'Chỉ Super Admin mới có quyền cập nhật cấu hình hệ thống!' };
    }
    const oldSettings = { ...settings };
    const updated = { ...settings, ...newSettings };
    setSettings(updated);

    logAudit({
      action: 'CAP_NHAT_CAU_HINH',
      entityType: 'settings',
      entityId: 'settings_global',
      beforeData: oldSettings,
      afterData: updated,
      details: 'Cập nhật cấu hình trường, năm học và quy chuẩn tính điểm thi đua',
    });

    return { success: true };
  };

  const resetToDefaultData = () => {
    const beforeState = {
      campusCount: campuses.length,
      classCount: classes.length,
      scoreLogCount: scoreLogs.length,
    };

    setCampuses(INITIAL_CAMPUSES);
    setClasses(INITIAL_CLASSES);
    setCriteria(INITIAL_CRITERIA);
    setScoreLogs(INITIAL_SCORE_LOGS);
    setSettings(INITIAL_SETTINGS);
    setUsers(INITIAL_USERS);
    setRedFlagDuties(INITIAL_RED_FLAG_DUTIES);
    setLockedWeeks([1, 2, 3]);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setAppeals(INITIAL_APPEALS);
    setCurrentUserId('u_admin');
    setSelectedWeek(4);
    setSelectedCampusId('all');
    setSelectedGrade('all');

    logAudit({
      action: 'KHOI_PHUC_HE_THONG',
      entityType: 'settings',
      entityId: 'system_reset',
      beforeData: beforeState,
      afterData: { campusCount: 6, classCount: 59, status: 'reset_default' },
      details: 'Khôi phục toàn bộ cấu hình và dữ liệu mẫu gốc 6 phân hiệu, 59 lớp học',
    });
  };

  const exportDataBackup = () => {
    const backup = {
      exportDate: new Date().toISOString(),
      version: '2.0',
      school: 'Trường THCS Lê Hữu Lập',
      settings,
      campuses,
      classes,
      criteria,
      scoreLogs,
      users,
      redFlagDuties,
      lockedWeeks,
      auditLogs,
      appeals,
    };
    return JSON.stringify(backup, null, 2);
  };

  const importDataBackup = (jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      if (!data.campuses || !data.classes || !data.criteria || !data.scoreLogs) {
        return { success: false, message: 'Tệp sao lưu không đúng định dạng chuẩn của LHL Class Ranking.' };
      }
      if (data.campuses) setCampuses(data.campuses);
      if (data.classes) setClasses(data.classes);
      if (data.criteria) setCriteria(data.criteria);
      if (data.scoreLogs) setScoreLogs(data.scoreLogs);
      if (data.settings) setSettings(data.settings);
      if (data.users) setUsers(data.users);
      if (data.redFlagDuties) setRedFlagDuties(data.redFlagDuties);
      if (data.lockedWeeks) setLockedWeeks(data.lockedWeeks);
      if (data.auditLogs) setAuditLogs(data.auditLogs);
      if (data.appeals) setAppeals(data.appeals);

      logAudit({
        action: 'KHOI_PHUC_HE_THONG',
        entityType: 'settings',
        entityId: 'backup_restore',
        beforeData: null,
        afterData: { date: data.exportDate },
        details: 'Khôi phục hệ thống từ tệp sao lưu JSON',
      });

      return { success: true, message: 'Khôi phục dữ liệu hệ thống thành công!' };
    } catch {
      return { success: false, message: 'Lỗi giải mã file JSON. Vui lòng kiểm tra lại tệp.' };
    }
  };

  // 9.1 Multi-Year Management
  const switchAcademicYear = (targetYear: string): { success: boolean; message: string } => {
    if (targetYear === settings.academicYear) {
      return { success: true, message: `Hệ thống đang ở năm học ${targetYear}` };
    }

    // Auto archive current state if not archived yet
    const existingArchiveIndex = academicYearArchives.findIndex((a) => a.year === settings.academicYear);
    const currentArchive: AcademicYearArchive = {
      id: `archive_${settings.academicYear.replace(/[^a-zA-Z0-9]/g, '_')}`,
      year: settings.academicYear,
      archivedAt: new Date().toISOString(),
      archivedBy: currentUser.name,
      totalClasses: classes.length,
      totalScoreLogs: scoreLogs.length,
      lockedWeeks: [...lockedWeeks],
      classesSnapshot: [...classes],
      scoreLogsSnapshot: [...scoreLogs],
      settingsSnapshot: { ...settings },
      note: `Tự động lưu trữ khi chuyển sang năm học ${targetYear}`,
    };

    let updatedArchives = [...academicYearArchives];
    if (existingArchiveIndex >= 0) {
      updatedArchives[existingArchiveIndex] = currentArchive;
    } else {
      updatedArchives.push(currentArchive);
    }
    setAcademicYearArchives(updatedArchives);

    // Look for target archive
    const targetArchive = academicYearArchives.find((a) => a.year === targetYear);
    if (targetArchive) {
      setClasses(targetArchive.classesSnapshot);
      setScoreLogs(targetArchive.scoreLogsSnapshot);
      setLockedWeeks(targetArchive.lockedWeeks);
      setSettings((prev) => ({
        ...prev,
        ...targetArchive.settingsSnapshot,
        academicYear: targetYear,
      }));
    } else {
      setSettings((prev) => ({ ...prev, academicYear: targetYear }));
    }

    logAudit({
      action: 'CHUYEN_NAM_HOC',
      entityType: 'settings',
      entityId: `year_${targetYear}`,
      beforeData: { year: settings.academicYear },
      afterData: { year: targetYear, hasTargetArchive: !!targetArchive },
      details: `Chuyển không gian làm việc sang năm học ${targetYear}`,
    });

    return { success: true, message: `Đã chuyển sang năm học ${targetYear} thành công!` };
  };

  const createNewAcademicYear = (
    newYear: string,
    options: { advanceGrades?: boolean; archiveCurrentYear?: boolean; resetScores?: boolean; note?: string }
  ): { success: boolean; message: string } => {
    const trimmedYear = newYear.trim();
    if (!trimmedYear) return { success: false, message: 'Vui lòng nhập tên năm học mới (VD: 2027-2028)' };

    // 1. Archive current year if requested
    if (options.archiveCurrentYear !== false) {
      const archiveObj: AcademicYearArchive = {
        id: `archive_${Date.now()}_${settings.academicYear.replace(/[^a-zA-Z0-9]/g, '_')}`,
        year: settings.academicYear,
        archivedAt: new Date().toISOString(),
        archivedBy: currentUser.name,
        totalClasses: classes.length,
        totalScoreLogs: scoreLogs.length,
        lockedWeeks: [...lockedWeeks],
        classesSnapshot: [...classes],
        scoreLogsSnapshot: [...scoreLogs],
        settingsSnapshot: { ...settings },
        note: options.note || `Lưu trữ trước khi khởi tạo năm học mới ${trimmedYear}`,
      };
      setAcademicYearArchives((prev) => [archiveObj, ...prev.filter((a) => a.year !== settings.academicYear)]);
    }

    // 2. Prepare classes (advance grades or keep standard roster)
    let newClasses = [...classes];
    if (options.advanceGrades) {
      newClasses = classes.map((c) => {
        let nextGrade = c.grade + 1;
        let nextName = c.name;
        if (c.grade < 9) {
          nextName = c.name.replace(new RegExp(`^${c.grade}`), `${nextGrade}`);
        } else {
          // Grade 9 graduates: becomes a new Grade 6 cohort
          nextGrade = 6;
          nextName = c.name.replace(/^9/, '6');
        }
        return {
          ...c,
          grade: nextGrade as (6 | 7 | 8 | 9),
          name: nextName,
        };
      });
      setClasses(newClasses);
    }

    // 3. Reset scores if requested
    if (options.resetScores !== false) {
      setScoreLogs([]);
      setLockedWeeks([]);
      setSelectedWeek(1);
    }

    // 4. Update settings
    setSettings((prev) => ({
      ...prev,
      academicYear: trimmedYear,
      currentWeek: 1,
      lockedWeeks: [],
    }));

    logAudit({
      action: 'CHUYEN_NAM_HOC',
      entityType: 'settings',
      entityId: `new_year_${trimmedYear}`,
      beforeData: { oldYear: settings.academicYear },
      afterData: { newYear: trimmedYear, options },
      details: `Khởi tạo năm học mới ${trimmedYear} (Lên lớp: ${options.advanceGrades ? 'Có' : 'Không'}, Reset điểm: ${options.resetScores ? 'Có' : 'Không'})`,
    });

    return { success: true, message: `Khởi tạo thành công năm học mới ${trimmedYear}!` };
  };

  const deleteArchivedYear = (archiveId: string): { success: boolean; message: string } => {
    setAcademicYearArchives((prev) => prev.filter((a) => a.id !== archiveId));
    return { success: true, message: 'Đã xóa bản lưu trữ năm học thành công.' };
  };

  // 9.2 System Integrity & Regulation Compliance Audit
  const runSystemIntegrityAudit = () => {
    const issues: string[] = [];
    const passedChecks: string[] = [];
    const checkedAt = new Date().toISOString();

    // Check 1: 59 classes & 6 campuses
    if (classes.length === 59) {
      passedChecks.push(`Chuẩn hóa quy mô: 59/59 lớp học đầy đủ theo công văn phân hiệu`);
    } else {
      issues.push(`Số lượng lớp hiện tại là ${classes.length} (Quy chuẩn thiết kế là 59 lớp)`);
    }

    if (campuses.length === 6) {
      passedChecks.push(`Chuẩn hóa phân hiệu: 6/6 cơ sở (1 Trường chính + 5 Phân hiệu)`);
    } else {
      issues.push(`Số lượng phân hiệu hiện tại là ${campuses.length} (Chuẩn là 6 phân hiệu)`);
    }

    // Check 2: Campus linkage
    const campusIds = new Set(campuses.map((c) => c.id));
    const orphanClasses = classes.filter((c) => !campusIds.has(c.campusId));
    if (orphanClasses.length === 0) {
      passedChecks.push(`Phân bổ cơ sở: 100% lớp học (${classes.length} lớp) được liên kết đúng mã phân hiệu`);
    } else {
      issues.push(`Có ${orphanClasses.length} lớp có mã phân hiệu không tồn tại: ${orphanClasses.map((c) => c.name).join(', ')}`);
    }

    // Check 3: Grades distribution
    const validGrades = new Set([6, 7, 8, 9]);
    const invalidGradeClasses = classes.filter((c) => !validGrades.has(c.grade));
    if (invalidGradeClasses.length === 0) {
      passedChecks.push(`Phân loại khối: 100% lớp thuộc Khối 6, 7, 8, 9 theo hệ THCS`);
    } else {
      issues.push(`Có ${invalidGradeClasses.length} lớp có khối không hợp lệ (ngoài 6-9)`);
    }

    // Check 4: Criteria database & Caps integrity
    const evalConfig = settings.evaluationConfig || DEFAULT_EVALUATION_CONFIG;
    if (criteria.length >= 50) {
      passedChecks.push(`Bộ tiêu chí thi đua: Đạt ${criteria.length} tiêu chí chi tiết phân loại 8 danh mục`);
    } else {
      issues.push(`Số lượng tiêu chí ít hơn chuẩn (${criteria.length} tiêu chí)`);
    }

    if (evalConfig.dormitoryMaxCap === 3) {
      passedChecks.push(`Khống chế trần bán trú: Đúng trần tối đa trừ không quá 3đ/tuần`);
    } else {
      issues.push(`Trần bán trú hiện tại là ${evalConfig.dormitoryMaxCap}đ (chuẩn công văn là 3đ)`);
    }

    if (evalConfig.ceremonyMaxCap === 0.5) {
      passedChecks.push(`Khống chế đội nghi lễ Đội: Chuẩn tối đa không quá 0.5đ/lớp cả năm`);
    } else {
      issues.push(`Trần đội nghi lễ hiện tại là ${evalConfig.ceremonyMaxCap}đ (chuẩn là 0.5đ)`);
    }

    if (evalConfig.advancedClassesRatio === 0.7) {
      passedChecks.push(`Chỉ tiêu thi đua năm: Đúng tỷ lệ chuẩn 70% lớp Tiên tiến trở lên (35% Xuất sắc, 35% Tiên tiến)`);
    } else {
      issues.push(`Tỷ lệ lớp tiên tiến đang đặt ${Math.round(evalConfig.advancedClassesRatio * 100)}% (chuẩn là 70%)`);
    }

    // Check 5: Score logs integrity
    const classIds = new Set(classes.map((c) => c.id));
    const orphanLogs = scoreLogs.filter((l) => !classIds.has(l.classId));
    if (orphanLogs.length === 0) {
      passedChecks.push(`Nhật ký thi đua: ${scoreLogs.length} bản ghi đều liên kết chính xác với danh sách lớp`);
    } else {
      issues.push(`Có ${orphanLogs.length} bản ghi điểm thuộc về lớp không tồn tại`);
    }

    // Check 6: Locked weeks validation
    const invalidWeeks = lockedWeeks.filter((w) => w < 1 || w > 35);
    if (invalidWeeks.length === 0) {
      passedChecks.push(`Kiểm soát tuần chốt khóa: ${lockedWeeks.length} tuần khóa nằm trong biên độ 1-35`);
    } else {
      issues.push(`Có tuần khóa ngoài phạm vi 1-35: ${invalidWeeks.join(', ')}`);
    }

    logAudit({
      action: 'KIEM_TRA_TOAN_VEN',
      entityType: 'settings',
      entityId: `audit_${Date.now()}`,
      beforeData: null,
      afterData: { issuesCount: issues.length, passedCount: passedChecks.length },
      details: `Rà soát đối chiếu toàn vẹn quy chuẩn thi đua: ${issues.length === 0 ? 'Hoàn hảo 100%' : `Phát hiện ${issues.length} cảnh báo`}`,
    });

    return {
      isCompliant: issues.length === 0,
      issues,
      passedChecks,
      totalClasses: classes.length,
      totalCampuses: campuses.length,
      checkedAt,
    };
  };

  // 9.3 Stand-alone Excel Exports
  const exportOfflineStandbyWorkbook = (week?: number) => {
    const targetWeek = week || selectedWeek;
    exportOfflineStandbyEvaluationBook(classes, campuses, settings, targetWeek);

    logAudit({
      action: 'XUAT_EXCEL_TONG_HOP',
      entityType: 'settings',
      entityId: `excel_standby_w${targetWeek}`,
      beforeData: null,
      afterData: { week: targetWeek },
      details: `Xuất file Excel Chấm Điểm & Xếp Loại Offline Dự Phòng (Tuần ${targetWeek}) với công thức tự động`,
    });
  };

  const exportCurrentRankingsExcel = (
    periodType: 'week' | 'month' | 'semester' | 'year' = 'week',
    scopeTitle: string = 'Toàn trường'
  ) => {
    let r: RankingEntry[] = [];
    let periodTitle = '';

    switch (periodType) {
      case 'week':
        r = getWeeklyRankings(selectedWeek, selectedCampusId, selectedGrade);
        periodTitle = `Tuần ${selectedWeek}`;
        break;
      case 'month':
        r = getMonthlyRankings(selectedMonth, selectedCampusId, selectedGrade);
        periodTitle = `Tháng ${selectedMonth}`;
        break;
      case 'semester':
        r = getSemesterRankings(selectedSemester, selectedCampusId, selectedGrade);
        periodTitle = `Học kỳ ${selectedSemester === 1 ? 'I' : 'II'}`;
        break;
      case 'year':
        r = getYearlyRankings(selectedCampusId, selectedGrade);
        periodTitle = `Cả Năm Học ${settings.academicYear}`;
        break;
    }

    exportRankingsToExcel(r, periodTitle, settings.academicYear, scopeTitle);

    logAudit({
      action: 'XUAT_EXCEL_TONG_HOP',
      entityType: 'settings',
      entityId: `excel_rankings_${periodType}`,
      beforeData: null,
      afterData: { periodType, count: r.length },
      details: `Xuất file Excel Bảng Xếp Hạng Thi Đua (${periodTitle})`,
    });
  };

  const exportCurrentScoreLogsExcel = (filterDesc: string = 'Toàn bộ năm học') => {
    exportScoreLogsToExcel(scoreLogs, settings.academicYear, filterDesc);

    logAudit({
      action: 'XUAT_EXCEL_TONG_HOP',
      entityType: 'score_log',
      entityId: `excel_logs_${Date.now()}`,
      beforeData: null,
      afterData: { logCount: scoreLogs.length },
      details: `Xuất file Excel Sổ Nhật Ký Theo Dõi Vi Phạm & Khen Thưởng (${scoreLogs.length} bản ghi)`,
    });
  };

  const exportCriteriaCatalogExcel = () => {
    exportCriteriaCatalogToExcel(criteria, settings.academicYear);

    logAudit({
      action: 'XUAT_EXCEL_TONG_HOP',
      entityType: 'criteria',
      entityId: `excel_criteria_${Date.now()}`,
      beforeData: null,
      afterData: { criteriaCount: criteria.length },
      details: `Xuất file Excel Danh Mục Quy Chuẩn 64 Tiêu Chí Thi Đua Năm Học ${settings.academicYear}`,
    });
  };

  // 9.4 Full System Backup & Safe Restore
  const exportFullBackupPayload = (): string => {
    const payload: SystemFullBackupPayload = {
      version: '2.5.0',
      appName: 'Hệ Thống Đánh Giá & Xếp Loại Thi Đua Nề Nếp Học Sinh THCS Lê Hữu Lập',
      exportedAt: new Date().toISOString(),
      exportedBy: `${currentUser.name} (${currentUser.title})`,
      settings,
      campuses,
      classes,
      criteria,
      scoreLogs,
      lockedWeeks,
      appeals,
      auditLogs,
      academicYearArchives,
      users,
      redFlagDuties,
      checksum: `sha256_${Date.now().toString(36)}`,
    };

    logAudit({
      action: 'SAO_LUU_HE_THONG',
      entityType: 'settings',
      entityId: `backup_${Date.now()}`,
      beforeData: null,
      afterData: {
        classesCount: classes.length,
        logsCount: scoreLogs.length,
        archivesCount: academicYearArchives.length,
      },
      details: `Xuất bản sao lưu toàn bộ hệ thống (${classes.length} lớp, ${scoreLogs.length} nhật ký, ${academicYearArchives.length} năm học lưu trữ)`,
    });

    return JSON.stringify(payload, null, 2);
  };

  const restoreFullBackup = (payload: SystemFullBackupPayload): { success: boolean; message: string } => {
    try {
      if (!payload.campuses || !payload.classes || !payload.criteria) {
        return { success: false, message: 'Tệp sao lưu không hợp lệ hoặc thiếu cấu trúc phân hiệu/lớp/tiêu chí!' };
      }

      setCampuses(payload.campuses);
      setClasses(payload.classes);
      setCriteria(payload.criteria);
      if (payload.scoreLogs) setScoreLogs(payload.scoreLogs);
      if (payload.settings) setSettings(payload.settings);
      if (payload.users) setUsers(payload.users);
      if (payload.redFlagDuties) setRedFlagDuties(payload.redFlagDuties);
      if (payload.lockedWeeks) setLockedWeeks(payload.lockedWeeks);
      if (payload.auditLogs) setAuditLogs(payload.auditLogs);
      if (payload.appeals) setAppeals(payload.appeals);
      if (payload.academicYearArchives) setAcademicYearArchives(payload.academicYearArchives);

      logAudit({
        action: 'PHUC_HOI_HE_THONG',
        entityType: 'settings',
        entityId: `restore_${Date.now()}`,
        beforeData: null,
        afterData: {
          classesCount: payload.classes.length,
          logsCount: payload.scoreLogs?.length || 0,
        },
        details: `Khôi phục toàn bộ hệ thống từ tệp sao lưu phiên bản ${payload.version || '2.0'} (Ngày tạo: ${payload.exportedAt || 'Không rõ'})`,
      });

      return {
        success: true,
        message: `Phục hồi thành công: ${payload.classes.length} lớp, ${payload.scoreLogs?.length || 0} bản ghi điểm, ${payload.campuses.length} phân hiệu!`,
      };
    } catch {
      return { success: false, message: 'Lỗi xảy ra trong quá trình xử lý khôi phục dữ liệu!' };
    }
  };

  // 10. Scoring & Ranking Calculations
  // Điểm tuần:
  // Bắt đầu 100 điểm + tổng điểm thưởng tuần - tổng điểm phạt tuần.
  const getClassWeeklyScore = (classId: string, week: number): ClassWeeklyScore => {
    const baseScore = settings.basePointsPerWeek || 100;
    const logs = scoreLogs.filter(
      (l) => l.classId === classId && l.week === week && (l.period === 'week' || !l.period)
    );

    let bonusPoints = 0;
    let penaltyPoints = 0;

    logs.forEach((l) => {
      if (l.type === 'bonus' || l.totalPoints > 0) {
        bonusPoints += Math.abs(l.totalPoints);
      } else {
        penaltyPoints += Math.abs(l.totalPoints);
      }
    });

    const finalScore = Number((baseScore + bonusPoints - penaltyPoints).toFixed(2));

    return {
      classId,
      week,
      baseScore,
      bonusPoints,
      penaltyPoints,
      finalScore,
      logCount: logs.length,
    };
  };

  // Xếp hạng tuần:
  const getWeeklyRankings = (
    week: number,
    campusId = 'all',
    grade: number | 'all' = 'all'
  ): RankingEntry[] => {
    const targetClasses = classes.filter((c) => {
      if (campusId !== 'all' && c.campusId !== campusId) return false;
      if (grade !== 'all' && c.grade !== grade) return false;
      return true;
    });

    const entries: RankingEntry[] = targetClasses.map((cls) => {
      const campus = campuses.find((cmp) => cmp.id === cls.campusId) || {
        id: cls.campusId,
        code: '???',
        name: 'Chưa xác định',
        type: 'sub',
        leaderName: '---',
        phone: '',
        address: '',
        colorTheme: 'slate',
      };

      const scoreInfo = getClassWeeklyScore(cls.id, week);

      return {
        rank: 0,
        classItem: cls,
        campus,
        totalScore: scoreInfo.finalScore,
        baseScore: scoreInfo.baseScore,
        bonusPoints: scoreInfo.bonusPoints,
        penaltyPoints: scoreInfo.penaltyPoints,
        logCount: scoreInfo.logCount,
        performanceTier: determineTier(scoreInfo.finalScore),
        weekBreakdown: [{ week, score: scoreInfo.finalScore }],
      };
    });

    // Sort: highest score first; tie breaker: bonus points desc, penalty points asc, name
    entries.sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      if (b.bonusPoints !== a.bonusPoints) return b.bonusPoints - a.bonusPoints;
      if (a.penaltyPoints !== b.penaltyPoints) return a.penaltyPoints - b.penaltyPoints;
      return a.classItem.name.localeCompare(b.classItem.name);
    });

    entries.forEach((item, index) => {
      item.rank = index + 1;
    });

    return entries;
  };

  // Xếp hạng tháng:
  // Bình quân điểm các tuần trong tháng + Điểm cộng tháng - Điểm trừ tháng (ví dụ vi phạm quy chế thi)
  const getMonthlyRankings = (
    month: number,
    campusId = 'all',
    grade: number | 'all' = 'all'
  ): RankingEntry[] => {
    const weeksInMonth = settings.monthWeeksMap[month] || [1, 2, 3, 4];

    const targetClasses = classes.filter((c) => {
      if (campusId !== 'all' && c.campusId !== campusId) return false;
      if (grade !== 'all' && c.grade !== grade) return false;
      return true;
    });

    const entries: RankingEntry[] = targetClasses.map((cls) => {
      const campus = campuses.find((cmp) => cmp.id === cls.campusId) || campuses[0];
      const weekScores = weeksInMonth.map((w) => ({
        week: w,
        score: getClassWeeklyScore(cls.id, w).finalScore,
      }));

      const sumWeeks = weekScores.reduce((acc, curr) => acc + curr.score, 0);
      const avgWeeks = weeksInMonth.length > 0 ? sumWeeks / weeksInMonth.length : 100;

      // Monthly logs (Phong trào, Cuộc thi cấp trên, Vi phạm quy chế thi)
      const monthLogs = scoreLogs.filter(
        (l) =>
          l.classId === cls.id &&
          l.period === 'month' &&
          (l.month === month || (l.date && parseInt(l.date.split('-')[1], 10) === month))
      );

      let monthBonus = 0;
      let monthPenalty = 0;
      monthLogs.forEach((l) => {
        if (l.type === 'bonus' || l.totalPoints > 0) {
          monthBonus += Math.abs(l.totalPoints);
        } else {
          monthPenalty += Math.abs(l.totalPoints);
        }
      });

      const totalScore = Number((avgWeeks + monthBonus - monthPenalty).toFixed(2));

      return {
        rank: 0,
        classItem: cls,
        campus,
        totalScore,
        baseScore: Number(avgWeeks.toFixed(2)),
        bonusPoints: 0,
        penaltyPoints: 0,
        monthBonusPoints: monthBonus,
        monthPenaltyPoints: monthPenalty,
        logCount: weekScores.length + monthLogs.length,
        performanceTier: determineTier(totalScore),
        averageScore: Number(avgWeeks.toFixed(2)),
        weekBreakdown: weekScores,
      };
    });

    entries.sort((a, b) => b.totalScore - a.totalScore || a.classItem.name.localeCompare(b.classItem.name));
    entries.forEach((item, index) => {
      item.rank = index + 1;
    });

    return entries;
  };

  // Xếp hạng học kỳ: bình quân điểm các tháng trong học kỳ
  const getSemesterRankings = (
    semester: 1 | 2,
    campusId = 'all',
    grade: number | 'all' = 'all'
  ): RankingEntry[] => {
    const months = semester === 1 ? [9, 10, 11, 12] : [1, 2, 3, 4];

    const targetClasses = classes.filter((c) => {
      if (campusId !== 'all' && c.campusId !== campusId) return false;
      if (grade !== 'all' && c.grade !== grade) return false;
      return true;
    });

    const entries: RankingEntry[] = targetClasses.map((cls) => {
      const campus = campuses.find((cmp) => cmp.id === cls.campusId) || campuses[0];

      const monthScores = months.map((m) => {
        const monthRankings = getMonthlyRankings(m, 'all', 'all');
        const found = monthRankings.find((r) => r.classItem.id === cls.id);
        return found ? found.totalScore : 100;
      });

      const sum = monthScores.reduce((a, b) => a + b, 0);
      const avg = Number((sum / (months.length || 1)).toFixed(2));

      return {
        rank: 0,
        classItem: cls,
        campus,
        totalScore: avg,
        baseScore: 100,
        bonusPoints: 0,
        penaltyPoints: 0,
        logCount: months.length,
        performanceTier: determineTier(avg),
        averageScore: avg,
      };
    });

    entries.sort((a, b) => b.totalScore - a.totalScore || a.classItem.name.localeCompare(b.classItem.name));
    entries.forEach((item, index) => {
      item.rank = index + 1;
    });

    return entries;
  };

  // Xếp hạng năm học = (HKI + HKII × 2) / 3 + Điểm cộng cả năm (CLB văn hóa, giải tỉnh K9, đội nghi lễ)
  // Đặc biệt: "Lớp có HS vi phạm bị hội đồng kỷ luật xử lý sẽ không xếp loại cả năm"
  const getYearlyRankings = (campusId = 'all', grade: number | 'all' = 'all'): RankingEntry[] => {
    const sem1List = getSemesterRankings(1, campusId, grade);
    const sem2List = getSemesterRankings(2, campusId, grade);

    const entries: RankingEntry[] = sem1List.map((entry) => {
      const sem2Entry = sem2List.find((s2) => s2.classItem.id === entry.classItem.id);
      const s1 = entry.totalScore;
      const s2 = sem2Entry ? sem2Entry.totalScore : s1;
      const baseYearScore = Number(((s1 + s2 * 2) / 3).toFixed(2));

      // Yearly bonus logs (Giao lưu CLB văn hóa K6-8, Đội tuyển tỉnh K9, Đội nghi lễ)
      const yearLogs = scoreLogs.filter((l) => l.classId === entry.classItem.id && l.period === 'year');
      let yearBonusPoints = 0;
      yearLogs.forEach((l) => {
        if (l.type === 'bonus' || l.totalPoints > 0) {
          yearBonusPoints += Math.abs(l.totalPoints);
        }
      });

      const finalYearScore = Number((baseYearScore + yearBonusPoints).toFixed(2));

      // Check Disciplinary Disqualification
      const disciplinaryLog = scoreLogs.find(
        (l) =>
          l.classId === entry.classItem.id &&
          (l.isDisciplinary || l.criteriaId === 'crit_hv_03' || l.criteriaId === 'crit_hv_04')
      );

      const isDisqualifiedYearly = !!disciplinaryLog;
      const disqualificationReason = isDisqualifiedYearly
        ? `Lớp có HS vi phạm bị Hội đồng kỷ luật xử lý (${disciplinaryLog?.criteriaName || 'Vi phạm kỷ luật'}) - Không xếp loại cả năm.`
        : undefined;

      return {
        ...entry,
        totalScore: finalYearScore,
        baseScore: baseYearScore,
        yearBonusPoints,
        semester1Score: s1,
        semester2Score: s2,
        performanceTier: isDisqualifiedYearly ? 'Cần cố gắng' : determineTier(finalYearScore),
        isDisqualifiedYearly,
        disqualificationReason,
      };
    });

    // Qualified classes ranked first, disqualified classes placed at bottom
    entries.sort((a, b) => {
      if (a.isDisqualifiedYearly !== b.isDisqualifiedYearly) {
        return a.isDisqualifiedYearly ? 1 : -1;
      }
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }
      return a.classItem.name.localeCompare(b.classItem.name);
    });

    let activeRank = 1;
    entries.forEach((item) => {
      if (item.isDisqualifiedYearly) {
        item.rank = 0; // Unranked
      } else {
        item.rank = activeRank++;
      }
    });

    return entries;
  };

  // 11. Overall School Stats
  const getSchoolStats = (week: number) => {
    const rankings = getWeeklyRankings(week, 'all', 'all');
    if (rankings.length === 0) {
      return {
        avgScore: 100,
        highestScore: 100,
        lowestScore: 100,
        totalBonusPoints: 0,
        totalPenaltyPoints: 0,
        totalViolations: 0,
        totalHonors: 0,
        topClass: null,
        topCampus: null,
      };
    }

    const totalSum = rankings.reduce((acc, r) => acc + r.totalScore, 0);
    const avgScore = Number((totalSum / rankings.length).toFixed(1));
    const highestScore = rankings[0].totalScore;
    const lowestScore = rankings[rankings.length - 1].totalScore;

    const currentWeekLogs = scoreLogs.filter((l) => l.week === week && (l.period === 'week' || !l.period));
    let totalBonusPoints = 0;
    let totalPenaltyPoints = 0;
    let totalViolations = 0;
    let totalHonors = 0;

    currentWeekLogs.forEach((l) => {
      if (l.type === 'bonus' || l.totalPoints > 0) {
        totalBonusPoints += Math.abs(l.totalPoints);
        totalHonors += l.quantity;
      } else {
        totalPenaltyPoints += Math.abs(l.totalPoints);
        totalViolations += l.quantity;
      }
    });

    let bestCampus: { campus: Campus; avgScore: number } | null = null;
    campuses.forEach((camp) => {
      const campClasses = rankings.filter((r) => r.campus.id === camp.id);
      if (campClasses.length > 0) {
        const campSum = campClasses.reduce((acc, c) => acc + c.totalScore, 0);
        const campAvg = Number((campSum / campClasses.length).toFixed(1));
        if (!bestCampus || campAvg > bestCampus.avgScore) {
          bestCampus = { campus: camp, avgScore: campAvg };
        }
      }
    });

    return {
      avgScore,
      highestScore,
      lowestScore,
      totalBonusPoints,
      totalPenaltyPoints,
      totalViolations,
      totalHonors,
      topClass: rankings[0] || null,
      topCampus: bestCampus,
    };
  };

  return (
    <AppContext.Provider
      value={{
        userRole,
        canAccessTab,
        visibleClasses,
        visibleCampuses,
        visibleScoreLogs,
        auditLogs,
        logAudit,
        appeals,
        submitAppeal,
        reviewAppeal,
        addUser,
        updateUser,
        deleteUser,
        campuses,
        classes,
        criteria,
        scoreLogs,
        settings,
        users,
        currentUser,
        currentTab,
        selectedCampusId,
        selectedGrade,
        selectedWeek,
        selectedMonth,
        selectedSemester,
        setCurrentTab,
        setSelectedCampusId,
        setSelectedGrade,
        setSelectedWeek,
        setSelectedMonth,
        setSelectedSemester,
        switchCurrentUser,
        addCampus,
        updateCampus,
        deleteCampus,
        addClass,
        updateClass,
        deleteClass,
        addCriteria,
        updateCriteria,
        deleteCriteria,
        toggleCriteriaActive,
        addScoreLog,
        updateScoreLog,
        deleteScoreLog,
        bulkAddScoreLogs,
        redFlagDuties,
        lockedWeeks,
        isWeekLocked,
        toggleLockWeek,
        addRedFlagDuty,
        updateRedFlagDuty,
        deleteRedFlagDuty,
        previewCriteriaCalculation,
        updateSettings,
        resetToDefaultData,
        exportDataBackup,
        importDataBackup,
        academicYearArchives,
        switchAcademicYear,
        createNewAcademicYear,
        deleteArchivedYear,
        runSystemIntegrityAudit,
        exportOfflineStandbyWorkbook,
        exportCurrentRankingsExcel,
        exportCurrentScoreLogsExcel,
        exportCriteriaCatalogExcel,
        exportFullBackupPayload,
        restoreFullBackup,
        getClassWeeklyScore,
        getWeeklyRankings,
        getMonthlyRankings,
        getSemesterRankings,
        getYearlyRankings,
        getSchoolStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
