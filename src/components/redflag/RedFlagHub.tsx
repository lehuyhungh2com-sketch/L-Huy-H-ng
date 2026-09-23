import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Criteria, ClassItem, Campus, RedFlagDuty, ScoreLog } from '../../types';
import {
  Flag,
  Calendar,
  Zap,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Award,
  Clock,
  UserCheck,
  Search,
  Plus,
  Trash2,
  ChevronRight,
  Filter,
  BarChart2,
  ListFilter,
  FileSpreadsheet,
  X,
  Edit2,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Eye,
} from 'lucide-react';

interface DraftViolationItem {
  id: string;
  criteriaId: string;
  criteria: Criteria;
  quantity: number;
  pointsPerUnit: number;
  totalPoints: number;
  note: string;
  calculationDetail: string;
  isDisciplinary: boolean;
}

export const RedFlagHub: React.FC = () => {
  const {
    campuses,
    classes,
    criteria,
    scoreLogs,
    settings,
    currentUser,
    selectedCampusId,
    setSelectedCampusId,
    selectedWeek,
    setSelectedWeek,
    redFlagDuties,
    lockedWeeks,
    isWeekLocked,
    toggleLockWeek,
    addRedFlagDuty,
    updateRedFlagDuty,
    deleteRedFlagDuty,
    bulkAddScoreLogs,
    deleteScoreLog,
    getClassWeeklyScore,
    getWeeklyRankings,
    previewCriteriaCalculation,
  } = useApp();

  // Navigation sub-tabs inside Red Flag module
  const [subTab, setSubTab] = useState<'input' | 'schedule' | 'monitor'>('input');

  // Lock status for the currently selected week
  const weekLocked = isWeekLocked(selectedWeek);
  const canManageLock = currentUser.role === 'admin' || currentUser.role === 'inspector';

  // -------------------------------------------------------------
  // TAB 1: FAST INPUT STATE
  // Flow: CHỌN PHÂN HIỆU → CHỌN LỚP → CHỌN TIÊU CHÍ → NHẬP SỐ LẦN → HỆ THỐNG TỰ TÍNH ĐIỂM
  // -------------------------------------------------------------
  const [inputCampusId, setInputCampusId] = useState<string>(() => {
    return selectedCampusId !== 'all' ? selectedCampusId : (campuses[0]?.id || 'lhl_main');
  });
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<number | 'all'>('all');

  // Criteria selection state
  const [criteriaSearch, setCriteriaSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeCriteriaId, setActiveCriteriaId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [itemNote, setItemNote] = useState<string>('');
  
  // Auditor / Inspector state
  const [inspectorName, setInspectorName] = useState<string>(() => {
    return currentUser.name || 'Đội Cờ Đỏ Liên đội';
  });
  const [logDate, setLogDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Draft cart for multiple violations in a single session
  const [draftItems, setDraftItems] = useState<DraftViolationItem[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // -------------------------------------------------------------
  // TAB 2: SCHEDULE STATE
  // -------------------------------------------------------------
  const [scheduleCampusFilter, setScheduleCampusFilter] = useState<string>('all');
  const [showDutyModal, setShowDutyModal] = useState<boolean>(false);
  const [editingDutyId, setEditingDutyId] = useState<string | null>(null);
  const [dutyFormData, setDutyFormData] = useState<{
    campusId: string;
    dayOfWeek: RedFlagDuty['dayOfWeek'];
    assignedClassId: string;
    inspectorNames: string;
    dutyArea: string;
    notes: string;
  }>({
    campusId: campuses[0]?.id || 'lhl_main',
    dayOfWeek: 'Thứ 2',
    assignedClassId: '',
    inspectorNames: '',
    dutyArea: 'Khu phòng học & Cổng trường',
    notes: '',
  });

  // -------------------------------------------------------------
  // TAB 3: MONITOR & AUDIT STATE
  // -------------------------------------------------------------
  const [auditCampusFilter, setAuditCampusFilter] = useState<string>('all');
  const [auditClassFilter, setAuditClassFilter] = useState<string>('all');
  const [auditSearch, setAuditSearch] = useState<string>('');

  // Confirmation modal state for week lock
  const [showLockConfirmModal, setShowLockConfirmModal] = useState<boolean>(false);

  // Filtered classes for current campus input
  const campusClasses = useMemo(() => {
    return classes.filter((c) => {
      const matchCampus = c.campusId === inputCampusId;
      const matchGrade = selectedGradeFilter === 'all' || c.grade === selectedGradeFilter;
      return matchCampus && matchGrade;
    });
  }, [classes, inputCampusId, selectedGradeFilter]);

  // Selected class object
  const currentClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId);
  }, [classes, selectedClassId]);

  // Current class live weekly score
  const currentClassWeeklyScore = useMemo(() => {
    if (!selectedClassId) return null;
    return getClassWeeklyScore(selectedClassId, selectedWeek);
  }, [selectedClassId, selectedWeek, getClassWeeklyScore, scoreLogs]);

  // Filtered criteria list for fast picker
  const filteredCriteria = useMemo(() => {
    return criteria.filter((crit) => {
      if (!crit.isActive) return false;
      const matchSearch =
        criteriaSearch === '' ||
        crit.name.toLowerCase().includes(criteriaSearch.toLowerCase()) ||
        crit.code.toLowerCase().includes(criteriaSearch.toLowerCase());
      const matchCategory = selectedCategory === 'all' || crit.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [criteria, criteriaSearch, selectedCategory]);

  // Available categories in criteria
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    criteria.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set);
  }, [criteria]);

  // Live calculation preview for the active criteria and quantity
  const activeCalcPreview = useMemo(() => {
    if (!activeCriteriaId || !selectedClassId || quantity <= 0) return null;
    return previewCriteriaCalculation(activeCriteriaId, quantity, selectedClassId);
  }, [activeCriteriaId, selectedClassId, quantity, previewCriteriaCalculation]);

  // Calculate projected score if all draft items are committed
  const projectedScore = useMemo(() => {
    if (!currentClassWeeklyScore) return null;
    const currentScore = currentClassWeeklyScore.finalScore;
    const draftDelta = draftItems.reduce((acc, item) => acc + item.totalPoints, 0);
    return Math.round((currentScore + draftDelta) * 10) / 10;
  }, [currentClassWeeklyScore, draftItems]);

  // Shortcuts for popular criteria
  const popularShortcuts = useMemo(() => {
    const popularCodes = ['TP02', 'CC01', 'TP04', 'VS01', 'HV04', 'HV05', 'TT01', 'CR01'];
    return criteria.filter((c) => popularCodes.includes(c.code) && c.isActive);
  }, [criteria]);

  // Handlers for Fast Input
  const handleSelectShortcut = (crit: Criteria) => {
    setActiveCriteriaId(crit.id);
  };

  const handleAddDraftItem = () => {
    if (!selectedClassId) {
      setErrorMessage('Vui lòng chọn Lớp trước khi thêm tiêu chí vi phạm!');
      return;
    }
    if (!activeCriteriaId) {
      setErrorMessage('Vui lòng chọn Tiêu chí vi phạm hoặc Điểm thưởng!');
      return;
    }
    if (quantity <= 0) {
      setErrorMessage('Số lượng / số học sinh phải lớn hơn 0!');
      return;
    }

    const crit = criteria.find((c) => c.id === activeCriteriaId);
    if (!crit) return;

    const preview = previewCriteriaCalculation(crit.id, quantity, selectedClassId);

    const newItem: DraftViolationItem = {
      id: `draft_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      criteriaId: crit.id,
      criteria: crit,
      quantity,
      pointsPerUnit: preview.pointsPerUnit,
      totalPoints: preview.totalPoints,
      note: itemNote.trim(),
      calculationDetail: preview.calculationDetail,
      isDisciplinary: preview.isDisciplinary,
    };

    setDraftItems((prev) => [...prev, newItem]);
    setItemNote('');
    setErrorMessage(null);
    setSuccessMessage(`Đã thêm: "${crit.name}" (${preview.totalPoints >= 0 ? `+${preview.totalPoints}` : preview.totalPoints}đ) vào danh sách.`);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleRemoveDraftItem = (id: string) => {
    setDraftItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearDraft = () => {
    setDraftItems([]);
    setErrorMessage(null);
  };

  const handleSubmitAllDraft = () => {
    if (weekLocked) {
      setErrorMessage(`Tuần ${selectedWeek} đã bị KHÓA bởi Tổng Phụ Trách Đội. Không thể nhập điểm!`);
      return;
    }
    if (draftItems.length === 0) {
      setErrorMessage('Danh sách vi phạm / thưởng đang trống!');
      return;
    }
    if (!currentClass) {
      setErrorMessage('Không tìm thấy thông tin lớp!');
      return;
    }

    const logsToSave: Omit<ScoreLog, 'id'>[] = draftItems.map((item) => ({
      week: selectedWeek,
      period: item.criteria.period || 'week',
      classId: currentClass.id,
      className: currentClass.name,
      campusId: currentClass.campusId,
      campusName: campuses.find((c) => c.id === currentClass.campusId)?.name || 'Phân hiệu',
      campusType: campuses.find((c) => c.id === currentClass.campusId)?.type || 'sub',
      grade: currentClass.grade,
      criteriaId: item.criteriaId,
      criteriaCode: item.criteria.code,
      criteriaName: item.criteria.name,
      category: item.criteria.category,
      type: item.criteria.type,
      pointsPerUnit: item.pointsPerUnit,
      quantity: item.quantity,
      totalPoints: item.totalPoints,
      calculationDetail: item.calculationDetail,
      note: item.note || undefined,
      date: logDate,
      recordedBy: currentUser.name || 'Đội Cờ Đỏ',
      inspectorName: inspectorName.trim() || 'Đội viên Cờ Đỏ',
      isDisciplinary: item.isDisciplinary,
    }));

    const result = bulkAddScoreLogs(logsToSave);

    if (result.success) {
      setSuccessMessage(`✅ Đã lưu thành công ${logsToSave.length} mục vi phạm/thưởng cho lớp ${currentClass.name}! Điểm số tuần ${selectedWeek} đã được cập nhật ngay lập tức.`);
      setDraftItems([]);
      setErrorMessage(null);
    } else {
      setErrorMessage(result.message || 'Có lỗi xảy ra khi lưu dữ liệu!');
    }
  };

  // Toggle Week Lock
  const handleToggleLock = () => {
    const res = toggleLockWeek(selectedWeek);
    setShowLockConfirmModal(false);
    if (res.success) {
      setSuccessMessage(res.message);
    } else {
      setErrorMessage(res.message);
    }
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // -------------------------------------------------------------
  // TAB 2: SCHEDULE DUTIES LOGIC
  // -------------------------------------------------------------
  const filteredDuties = useMemo(() => {
    return redFlagDuties.filter((d) => {
      const matchWeek = d.week === selectedWeek;
      const matchCampus = scheduleCampusFilter === 'all' || d.campusId === scheduleCampusFilter;
      return matchWeek && matchCampus;
    });
  }, [redFlagDuties, selectedWeek, scheduleCampusFilter]);

  const handleOpenAddDuty = () => {
    setEditingDutyId(null);
    setDutyFormData({
      campusId: inputCampusId,
      dayOfWeek: 'Thứ 2',
      assignedClassId: campusClasses[0]?.id || '',
      inspectorNames: '',
      dutyArea: 'Khu phòng học & Cổng trường',
      notes: '',
    });
    setShowDutyModal(true);
  };

  const handleSaveDuty = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedClass = classes.find((c) => c.id === dutyFormData.assignedClassId);
    if (!assignedClass) {
      alert('Vui lòng chọn lớp trực!');
      return;
    }

    if (editingDutyId) {
      updateRedFlagDuty(editingDutyId, {
        week: selectedWeek,
        campusId: dutyFormData.campusId,
        dayOfWeek: dutyFormData.dayOfWeek,
        assignedClassId: assignedClass.id,
        assignedClassName: assignedClass.name,
        inspectorNames: dutyFormData.inspectorNames.trim(),
        dutyArea: dutyFormData.dutyArea.trim(),
        notes: dutyFormData.notes.trim(),
      });
      setSuccessMessage('Đã cập nhật phân công trực cờ đỏ!');
    } else {
      addRedFlagDuty({
        week: selectedWeek,
        campusId: dutyFormData.campusId,
        dayOfWeek: dutyFormData.dayOfWeek,
        assignedClassId: assignedClass.id,
        assignedClassName: assignedClass.name,
        inspectorNames: dutyFormData.inspectorNames.trim(),
        dutyArea: dutyFormData.dutyArea.trim(),
        notes: dutyFormData.notes.trim(),
      });
      setSuccessMessage('Đã tạo phân công ca trực cờ đỏ mới!');
    }
    setShowDutyModal(false);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // -------------------------------------------------------------
  // TAB 3: MONITOR STATS & AUDIT LOGS
  // -------------------------------------------------------------
  const weekRankings = useMemo(() => {
    return getWeeklyRankings(selectedWeek, auditCampusFilter, 'all');
  }, [getWeeklyRankings, selectedWeek, auditCampusFilter, scoreLogs]);

  // Weekly Stats
  const weekStats = useMemo(() => {
    const weekLogs = scoreLogs.filter((l) => l.week === selectedWeek);
    const bonus = weekLogs
      .filter((l) => l.totalPoints > 0)
      .reduce((sum, l) => sum + l.totalPoints, 0);
    const penalty = weekLogs
      .filter((l) => l.totalPoints < 0)
      .reduce((sum, l) => sum + Math.abs(l.totalPoints), 0);

    const avg = weekRankings.length > 0
      ? weekRankings.reduce((sum, r) => sum + r.totalScore, 0) / weekRankings.length
      : 100;

    return {
      totalBonusPoints: Math.round(bonus * 10) / 10,
      totalPenaltyPoints: Math.round(penalty * 10) / 10,
      averageScore: Math.round(avg * 10) / 10,
      totalEntries: weekLogs.length,
      topClasses: weekRankings.slice(0, 5),
      lowClasses: weekRankings
        .filter((r) => r.totalScore < 95 || r.rank > weekRankings.length - 5)
        .sort((a, b) => a.totalScore - b.totalScore)
        .slice(0, 5),
    };
  }, [scoreLogs, selectedWeek, weekRankings]);

  // Common errors (Frequency aggregation)
  const commonErrors = useMemo(() => {
    const counts: Record<string, { name: string; code: string; count: number; totalPenalty: number }> = {};
    const weekLogs = scoreLogs.filter((l) => l.week === selectedWeek && l.totalPoints < 0);
    
    weekLogs.forEach((log) => {
      const key = log.criteriaId || log.criteriaCode;
      if (!counts[key]) {
        counts[key] = {
          name: log.criteriaName,
          code: log.criteriaCode,
          count: 0,
          totalPenalty: 0,
        };
      }
      counts[key].count += log.quantity;
      counts[key].totalPenalty += Math.abs(log.totalPoints);
    });

    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [scoreLogs, selectedWeek]);

  // Filtered audit logs
  const auditLogs = useMemo(() => {
    return scoreLogs
      .filter((l) => {
        const matchWeek = l.week === selectedWeek;
        const matchCampus = auditCampusFilter === 'all' || l.campusId === auditCampusFilter;
        const matchClass = auditClassFilter === 'all' || l.classId === auditClassFilter;
        const matchSearch =
          auditSearch === '' ||
          l.className.toLowerCase().includes(auditSearch.toLowerCase()) ||
          l.criteriaName.toLowerCase().includes(auditSearch.toLowerCase()) ||
          (l.note && l.note.toLowerCase().includes(auditSearch.toLowerCase())) ||
          (l.inspectorName && l.inspectorName.toLowerCase().includes(auditSearch.toLowerCase())) ||
          (l.recordedBy && l.recordedBy.toLowerCase().includes(auditSearch.toLowerCase()));

        return matchWeek && matchCampus && matchClass && matchSearch;
      })
      .slice(0, 100);
  }, [scoreLogs, selectedWeek, auditCampusFilter, auditClassFilter, auditSearch]);

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & CONTROLS */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-indigo-700 text-white rounded-2xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold text-rose-100">
              <Flag size={14} className="text-yellow-300 animate-pulse" />
              <span>HỆ THỐNG GIÁM SÁT NỀ NẾP & ĐỘI CỜ ĐỎ</span>
              <span className="opacity-60">•</span>
              <span>NĂM HỌC 2026-2027</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
              MODULE ĐỘI CỜ ĐỎ
            </h1>
            <p className="text-xs sm:text-sm text-rose-100/90 max-w-2xl leading-relaxed">
              Nhập nhanh vi phạm, tự động tính điểm theo nề nếp 100đ, quản lý lịch trực tuần và kiểm soát khóa sổ dữ liệu chặt chẽ.
            </p>
          </div>

          {/* Week Selector & Lock Status Badge */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-900/40 p-3 rounded-xl backdrop-blur-md border border-white/10 self-start md:self-auto">
            {/* Week Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-200 font-medium">Tuần:</span>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(Number(e.target.value))}
                className="bg-white text-slate-800 text-sm font-bold rounded-lg px-3 py-1.5 shadow-xs focus:ring-2 focus:ring-rose-400 outline-hidden"
              >
                {Array.from({ length: 35 }, (_, i) => i + 1).map((w) => (
                  <option key={w} value={w}>
                    Tuần {w} {isWeekLocked(w) ? '🔒 (Đã khóa)' : '🟢'}
                  </option>
                ))}
              </select>
            </div>

            {/* Lock Badge */}
            {weekLocked ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 text-amber-200 border border-amber-400/40 rounded-lg text-xs font-bold">
                <Lock size={14} className="text-amber-300" />
                <span>ĐÃ KHÓA SỔ</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 rounded-lg text-xs font-bold">
                <Unlock size={14} className="text-emerald-300" />
                <span>ĐANG MỞ CHẤM</span>
              </div>
            )}

            {/* Lock / Unlock Action Button */}
            {canManageLock && (
              <button
                onClick={() => setShowLockConfirmModal(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                  weekLocked
                    ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold'
                    : 'bg-rose-500 hover:bg-rose-400 text-white'
                }`}
                title={weekLocked ? 'Mở khóa để tiếp tục nhập' : 'Chốt số liệu và khóa tuần'}
              >
                {weekLocked ? <Unlock size={14} /> : <Lock size={14} />}
                <span>{weekLocked ? 'Mở khóa tuần' : 'Khóa chốt tuần'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Auditor Banner */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-rose-100">
          <div className="flex items-center gap-2">
            <UserCheck size={14} className="text-yellow-300" />
            <span>Người nhập hiện tại:</span>
            <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded">
              {currentUser.name} ({currentUser.title || currentUser.role})
            </span>
          </div>
          <div className="text-[11px] text-rose-200 italic">
            Quy định: Mỗi lớp đầu tuần mặc định 100 điểm. Trừ điểm vi phạm & cộng điểm thưởng nề nếp.
          </div>
        </div>
      </div>

      {/* Week Locked Alert Banner */}
      {weekLocked && (
        <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-xl flex items-center justify-between gap-3 text-amber-900 shadow-xs">
          <div className="flex items-center gap-3">
            <ShieldAlert size={24} className="text-amber-600 shrink-0" />
            <div>
              <h4 className="text-sm font-bold">Tuần {selectedWeek} đã được Tổng Phụ Trách Đội / Quản Trị Viên Chốt Khóa Dữ Liệu!</h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Chế độ nhập điểm và chỉnh sửa biên bản vi phạm đã bị vô hiệu hóa để bảo đảm tính khách quan khi công bố thứ hạng thi đua.
              </p>
            </div>
          </div>
          {canManageLock && (
            <button
              onClick={() => setShowLockConfirmModal(true)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shrink-0 cursor-pointer shadow-xs"
            >
              Mở khóa dữ liệu
            </button>
          )}
        </div>
      )}

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 text-sm font-medium shadow-xs">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3 text-sm font-medium shadow-xs">
          <AlertTriangle size={18} className="text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSubTab('input')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            subTab === 'input'
              ? 'border-red-600 text-red-600 bg-red-50/50 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Zap size={16} className={subTab === 'input' ? 'text-red-600' : 'text-slate-400'} />
          <span>⚡ Nhập Vi Phạm & Điểm Nhanh</span>
          {draftItems.length > 0 && (
            <span className="bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              {draftItems.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setSubTab('schedule')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            subTab === 'schedule'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Calendar size={16} className={subTab === 'schedule' ? 'text-indigo-600' : 'text-slate-400'} />
          <span>📅 Lịch Tuần & Phân Công Cờ Đỏ</span>
          <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
            {filteredDuties.length} ca
          </span>
        </button>

        <button
          onClick={() => setSubTab('monitor')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            subTab === 'monitor'
              ? 'border-rose-600 text-rose-600 bg-rose-50/50 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <BarChart2 size={16} className={subTab === 'monitor' ? 'text-rose-600' : 'text-slate-400'} />
          <span>📊 Bảng Giám Sát Cờ Đỏ & Thống Kê</span>
        </button>
      </div>

      {/* --------------------------------------------------------------------------------- */}
      {/* SUB-TAB 1: FAST INPUT WORKFLOW */}
      {/* Flow: CHỌN PHÂN HIỆU → CHỌN LỚP → CHỌN TIÊU CHÍ → NHẬP SỐ LẦN → HỆ THỐNG TỰ TÍNH ĐIỂM */}
      {/* --------------------------------------------------------------------------------- */}
      {subTab === 'input' && (
        <div className="space-y-6">
          {/* Quick Step Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-semibold text-slate-500">
            <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${inputCampusId ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200'}`}>
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
              <span>Chọn Phân hiệu</span>
            </div>
            <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${selectedClassId ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200'}`}>
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
              <span>Chọn Lớp ({campusClasses.length})</span>
            </div>
            <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${activeCriteriaId ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200'}`}>
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">3</span>
              <span>Chọn Tiêu chí</span>
            </div>
            <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${draftItems.length > 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200'}`}>
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">4</span>
              <span>Tính điểm & Lưu ({draftItems.length})</span>
            </div>
          </div>

          {/* STEP 1: CHỌN PHÂN HIỆU */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[11px] font-black">1</span>
                <span>Bước 1: Chọn Phân Hiệu</span>
              </label>
              <span className="text-xs text-slate-500">6 Phân hiệu THCS Lê Hữu Lập</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {campuses.map((camp) => {
                const isSelected = inputCampusId === camp.id;
                const classCount = classes.filter((c) => c.campusId === camp.id).length;
                return (
                  <button
                    key={camp.id}
                    onClick={() => {
                      setInputCampusId(camp.id);
                      setSelectedClassId('');
                      setDraftItems([]);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-400 shadow-sm'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${camp.type === 'main' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                          {camp.code}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">{classCount} lớp</span>
                      </div>
                      <div className={`text-xs font-bold mt-2 leading-tight ${isSelected ? 'text-rose-900 font-extrabold' : 'text-slate-800'}`}>
                        {camp.name.split('–')[0].trim()}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: CHỌN LỚP & LIVE CLASS STATUS CARD */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[11px] font-black">2</span>
                <span>Bước 2: Chọn Lớp Cần Nhập Điểm</span>
              </label>

              {/* Grade Filter Pills */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto text-xs">
                <span className="text-slate-500 px-2 font-medium">Khối:</span>
                {(['all', 6, 7, 8, 9] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGradeFilter(g)}
                    className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                      selectedGradeFilter === g
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {g === 'all' ? 'Tất cả' : `Khối ${g}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Class Pill Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {campusClasses.map((cls) => {
                const isSelected = selectedClassId === cls.id;
                const scoreInfo = getClassWeeklyScore(cls.id, selectedWeek);
                return (
                  <button
                    key={cls.id}
                    onClick={() => {
                      if (selectedClassId !== cls.id) {
                        setSelectedClassId(cls.id);
                        setDraftItems([]);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-300'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <span className="text-sm font-black">{cls.name}</span>
                    <span className={`text-[10px] mt-0.5 font-bold ${
                      isSelected
                        ? 'text-rose-100'
                        : scoreInfo.finalScore >= 100
                        ? 'text-emerald-600'
                        : 'text-rose-600'
                    }`}>
                      {scoreInfo.finalScore}đ
                    </span>
                  </button>
                );
              })}
            </div>

            {/* LIVE CLASS STATUS CARD (Mỗi lớp đầu tuần mặc định 100 điểm) */}
            {currentClass && currentClassWeeklyScore && (
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-white">LỚP {currentClass.name}</span>
                      <span className="text-xs bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded border border-indigo-400/20">
                        {campuses.find((c) => c.id === currentClass.campusId)?.name}
                      </span>
                      <span className="text-xs text-slate-300">
                        GVCN: <strong>{currentClass.homeroomTeacher || 'Chưa phân công'}</strong>
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 flex items-center gap-3">
                      <span>Sĩ số: {currentClass.studentCount} HS</span>
                      <span>•</span>
                      <span>Lớp trưởng: {currentClass.monitorName || 'Chưa cập nhật'}</span>
                    </div>
                  </div>

                  {/* Score breakdown: Gốc 100đ + Thưởng - Trừ = Hiện tại */}
                  <div className="flex flex-wrap items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-xs border border-white/10">
                    <div className="text-center px-2">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Điểm gốc</div>
                      <div className="text-sm font-bold text-slate-200">100.0đ</div>
                    </div>
                    <div className="text-slate-500 font-bold">+</div>
                    <div className="text-center px-2">
                      <div className="text-[10px] text-emerald-300 uppercase font-semibold">Thưởng</div>
                      <div className="text-sm font-bold text-emerald-400">+{currentClassWeeklyScore.bonusPoints}đ</div>
                    </div>
                    <div className="text-slate-500 font-bold">-</div>
                    <div className="text-center px-2">
                      <div className="text-[10px] text-rose-300 uppercase font-semibold">Trừ</div>
                      <div className="text-sm font-bold text-rose-400">-{currentClassWeeklyScore.penaltyPoints}đ</div>
                    </div>
                    <div className="text-slate-500 font-bold">=</div>
                    <div className="text-center px-3 py-1 bg-white text-slate-900 rounded-lg shadow-xs">
                      <div className="text-[10px] text-slate-500 uppercase font-bold">Điểm hiện tại</div>
                      <div className="text-lg font-black text-indigo-700">{currentClassWeeklyScore.finalScore}đ</div>
                    </div>

                    {/* Preview after draft commit */}
                    {draftItems.length > 0 && projectedScore !== null && (
                      <div className="border-l border-white/20 pl-3 text-center">
                        <div className="text-[10px] text-amber-300 uppercase font-extrabold flex items-center gap-1">
                          <Sparkles size={11} /> Dự kiến sau khi lưu:
                        </div>
                        <div className="text-lg font-black text-amber-300">{projectedScore}đ</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* STEP 3 & 4: CHỌN TIÊU CHÍ, NHẬP SỐ LẦN & GIỎ VI PHẠM (MULTI-ERROR ENTRY) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Criteria Picker & Quantity (7 cols) */}
            <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[11px] font-black">3</span>
                  <span>Bước 3: Chọn Tiêu Chí & Nhập Số Lần</span>
                </label>
                <span className="text-xs text-slate-500">Bộ tiêu chí THCS Lê Hữu Lập</span>
              </div>

              {/* Quick shortcut chips for high frequency Red Flag errors */}
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Sparkles size={13} className="text-amber-500" />
                  <span>Vi phạm / Thành tích phổ biến (Nhấp chọn nhanh):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {popularShortcuts.map((crit) => (
                    <button
                      key={crit.id}
                      onClick={() => handleSelectShortcut(crit)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeCriteriaId === crit.id
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${crit.type === 'bonus' ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                      <span>{crit.name}</span>
                      <span className={`text-[10px] px-1 rounded ${activeCriteriaId === crit.id ? 'bg-rose-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                        {crit.type === 'bonus' ? `+${crit.points}` : `-${crit.points}`}đ
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Criteria by Search and Category */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1 border-t border-slate-100">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={criteriaSearch}
                    onChange={(e) => setCriteriaSearch(e.target.value)}
                    placeholder="Tìm tên lỗi, mã (VD: Sơ vin, Muộn, Khăn quàng, 9-10...)"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-rose-500 outline-hidden"
                  />
                  {criteriaSearch && (
                    <button
                      onClick={() => setCriteriaSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-hidden"
                >
                  <option value="all">Tất cả nhóm tiêu chí</option>
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Criteria List Selection (Scrollable) */}
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-100">
                {filteredCriteria.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    Không tìm thấy tiêu chí nào phù hợp với từ khóa tìm kiếm.
                  </div>
                ) : (
                  filteredCriteria.map((crit) => {
                    const isSelected = activeCriteriaId === crit.id;
                    const isBonus = crit.type === 'bonus';
                    return (
                      <div
                        key={crit.id}
                        onClick={() => setActiveCriteriaId(crit.id)}
                        className={`p-3 text-left transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-rose-50/90 font-medium'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                              {crit.code}
                            </span>
                            <span className="text-xs font-semibold text-slate-900 truncate">
                              {crit.name}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Nhóm: <strong>{crit.category}</strong> • Đơn vị: {crit.unit} • Chu kỳ: {crit.period === 'week' ? 'Tuần' : crit.period === 'month' ? 'Tháng' : 'Cả năm'}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`inline-block text-xs font-extrabold px-2 py-0.5 rounded-full ${
                            isBonus ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {isBonus ? `+${crit.points}` : `-${crit.points}`}đ/{crit.unit}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Quantity, Note & Engine Calculation Preview */}
              {activeCriteriaId && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Quantity Input */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>Số lần / Số học sinh vi phạm:</span>
                        <span className="text-[11px] text-indigo-600 font-semibold">
                          (Đơn vị: {criteria.find((c) => c.id === activeCriteriaId)?.unit})
                        </span>
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          className="w-9 h-9 rounded-lg bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="flex-1 py-1.5 px-3 text-center font-black text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => q + 1)}
                          className="w-9 h-9 rounded-lg bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Specific Student / Note */}
                    <div>
                      <label className="text-xs font-bold text-slate-700">
                        Chi tiết học sinh / Ghi chú vụ việc (tùy chọn):
                      </label>
                      <input
                        type="text"
                        value={itemNote}
                        onChange={(e) => setItemNote(e.target.value)}
                        placeholder="VD: Em Tuấn, em Nam không sơ vin..."
                        className="w-full mt-1 py-1.5 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Engine Calculation Preview Box */}
                  {activeCalcPreview && (
                    <div className="p-3 bg-white rounded-lg border border-indigo-200 text-xs text-indigo-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="font-bold flex items-center gap-1.5 text-indigo-900">
                          <CheckCircle2 size={14} className="text-indigo-600" />
                          <span>Tính toán theo quy chế: {activeCalcPreview.calculationDetail}</span>
                        </div>
                        {activeCalcPreview.appliedCap && (
                          <div className="text-[11px] text-amber-700 mt-0.5">
                            * Giới hạn điểm tối đa quy định trong tài liệu: {activeCalcPreview.appliedCap}đ
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[11px] text-slate-500 mr-2">Tổng điểm tạm tính:</span>
                        <span className={`text-base font-black ${activeCalcPreview.totalPoints >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {activeCalcPreview.totalPoints >= 0 ? `+${activeCalcPreview.totalPoints}` : activeCalcPreview.totalPoints}đ
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Add to Draft Cart Button */}
                  <button
                    type="button"
                    disabled={weekLocked || !selectedClassId}
                    onClick={handleAddDraftItem}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                      weekLocked || !selectedClassId
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-rose-600 hover:bg-rose-700 text-white'
                    }`}
                  >
                    <Plus size={16} />
                    <span>Thêm vào giỏ vi phạm / thưởng của lớp {currentClass?.name || ''}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Right: Multi-Item Draft Cart & Batch Submission (5 cols) */}
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Zap size={16} className="text-rose-600" />
                      <span>Giỏ Vi Phạm / Điểm Thưởng Chuẩn Bị Lưu</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Cho phép nhập nhiều lỗi trong cùng một lần chấm
                    </p>
                  </div>
                  {draftItems.length > 0 && (
                    <button
                      onClick={handleClearDraft}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                    >
                      Xóa tất cả
                    </button>
                  )}
                </div>

                {/* Target Class Badge */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600">Đang chấm cho lớp:</span>
                  <span className="font-extrabold text-indigo-700 text-sm">
                    {currentClass ? `Lớp ${currentClass.name}` : 'Chưa chọn lớp'}
                  </span>
                </div>

                {/* Draft Items List */}
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {draftItems.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl space-y-2">
                      <Flag size={28} className="mx-auto text-slate-300" />
                      <div className="text-xs font-medium">Chưa có vi phạm hoặc điểm thưởng nào được chọn.</div>
                      <div className="text-[11px] text-slate-400">
                        Chọn một hoặc nhiều tiêu chí từ danh sách bên trái để gom vào lần lưu này.
                      </div>
                    </div>
                  ) : (
                    draftItems.map((item, idx) => (
                      <div
                        key={item.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-slate-800 truncate">
                              {item.criteria.name}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Số lượng: <strong>{item.quantity}</strong> ({item.calculationDetail})
                          </div>
                          {item.note && (
                            <div className="text-[11px] text-slate-600 italic bg-white px-2 py-0.5 rounded border border-slate-200 inline-block">
                              Ghi chú: {item.note}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`font-black text-sm ${item.totalPoints >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {item.totalPoints >= 0 ? `+${item.totalPoints}` : item.totalPoints}đ
                          </span>
                          <button
                            onClick={() => handleRemoveDraftItem(item.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                            title="Xóa mục này"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Draft Totals */}
                {draftItems.length > 0 && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-bold text-rose-900">Tổng điểm biến động dự kiến:</span>
                    <span className={`text-base font-black ${
                      draftItems.reduce((acc, item) => acc + item.totalPoints, 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {draftItems.reduce((acc, item) => acc + item.totalPoints, 0) >= 0 ? '+' : ''}
                      {Math.round(draftItems.reduce((acc, item) => acc + item.totalPoints, 0) * 10) / 10}đ
                    </span>
                  </div>
                )}

                {/* Auditor / Inspector details inputs (Audit Trail) */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Nhật ký người nhập (Bắt buộc ghi nhận):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[11px] text-slate-500">Đội viên Cờ đỏ trực / Giám thị:</label>
                      <input
                        type="text"
                        value={inspectorName}
                        onChange={(e) => setInspectorName(e.target.value)}
                        placeholder="VD: Nguyễn Khánh Linh (9A1)"
                        className="w-full mt-0.5 py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-rose-500 outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500">Ngày ghi nhận:</label>
                      <input
                        type="date"
                        value={logDate}
                        onChange={(e) => setLogDate(e.target.value)}
                        className="w-full mt-0.5 py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-rose-500 outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={weekLocked || draftItems.length === 0 || !selectedClassId}
                  onClick={handleSubmitAllDraft}
                  className={`w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                    weekLocked || draftItems.length === 0 || !selectedClassId
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white'
                  }`}
                >
                  <CheckCircle2 size={18} />
                  <span>XÁC NHẬN LƯU {draftItems.length} MỤC VÀO ĐIỂM LỚP</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------------------- */}
      {/* SUB-TAB 2: SCHEDULE & RED FLAG TEAM ASSIGNMENTS */}
      {/* --------------------------------------------------------------------------------- */}
      {subTab === 'schedule' && (
        <div className="space-y-6">
          {/* Header Controls for Schedule */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <Calendar size={18} className="text-indigo-600" />
                <span>Lịch Phân Công Trực Tuần {selectedWeek} – Đội Cờ Đỏ</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Quản lý ca trực từ Thứ 2 đến Thứ 7, phân định rõ lớp trực cờ đỏ, học sinh phụ trách và khu vực kiểm tra.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Campus filter for schedule */}
              <select
                value={scheduleCampusFilter}
                onChange={(e) => setScheduleCampusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-semibold focus:ring-2 focus:ring-indigo-500 outline-hidden"
              >
                <option value="all">Tất cả 6 Phân hiệu</option>
                {campuses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              {/* Add Duty Button */}
              {canManageLock && (
                <button
                  onClick={handleOpenAddDuty}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                >
                  <Plus size={15} />
                  <span>Phân công ca trực mới</span>
                </button>
              )}
            </div>
          </div>

          {/* Schedule Table / Cards */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Thứ / Ngày trực</th>
                    <th className="py-3 px-4">Phân hiệu</th>
                    <th className="py-3 px-4">Lớp trực Cờ Đỏ</th>
                    <th className="py-3 px-4">Học sinh trực tuần</th>
                    <th className="py-3 px-4">Khu vực phân công</th>
                    <th className="py-3 px-4">Nhiệm vụ trọng tâm</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDuties.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400">
                        Chưa có lịch trực cờ đỏ nào cho Tuần {selectedWeek} ở phân hiệu này. Nhấp vào "Phân công ca trực mới" để tạo lịch.
                      </td>
                    </tr>
                  ) : (
                    filteredDuties.map((duty) => {
                      const campus = campuses.find((c) => c.id === duty.campusId);
                      return (
                        <tr key={duty.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
                              <Calendar size={13} />
                              <span>{duty.dayOfWeek}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="font-semibold text-slate-800">
                              {campus?.name || 'Chưa rõ'}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                              {duty.assignedClassName}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-700">
                            {duty.inspectorNames || 'Chưa chỉ định'}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {duty.dutyArea}
                          </td>
                          <td className="py-3 px-4 text-slate-500 italic max-w-xs truncate">
                            {duty.notes || 'Thực hiện chấm nề nếp theo quy chế'}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Quick Jump to Scoring */}
                              <button
                                onClick={() => {
                                  setInputCampusId(duty.campusId);
                                  setSelectedClassId(duty.assignedClassId);
                                  setInspectorName(duty.inspectorNames || currentUser.name);
                                  setSubTab('input');
                                }}
                                className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-md flex items-center gap-1 cursor-pointer"
                                title="Mở màn hình chấm điểm ngay"
                              >
                                <Zap size={12} />
                                <span>Chấm ngay</span>
                              </button>

                              {canManageLock && (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingDutyId(duty.id);
                                      setDutyFormData({
                                        campusId: duty.campusId,
                                        dayOfWeek: duty.dayOfWeek,
                                        assignedClassId: duty.assignedClassId,
                                        inspectorNames: duty.inspectorNames,
                                        dutyArea: duty.dutyArea,
                                        notes: duty.notes || '',
                                      });
                                      setShowDutyModal(true);
                                    }}
                                    className="p-1 text-slate-400 hover:text-indigo-600 rounded cursor-pointer"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`Xác nhận xóa ca trực của lớp ${duty.assignedClassName}?`)) {
                                        deleteRedFlagDuty(duty.id);
                                      }
                                    }}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------------------- */}
      {/* SUB-TAB 3: MONITORING DASHBOARD & DETAILED AUDIT TRAIL */}
      {/* --------------------------------------------------------------------------------- */}
      {subTab === 'monitor' && (
        <div className="space-y-6">
          {/* Key Metric Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Điểm trung bình tuần hiện tại */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Điểm Tuần Hiện Tại</div>
                <div className="text-2xl font-black text-indigo-700 mt-1">
                  {weekStats.averageScore}đ
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Điểm trung bình toàn trường Tuần {selectedWeek}
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BarChart2 size={24} />
              </div>
            </div>

            {/* Card 2: Tổng điểm trừ */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Điểm Trừ</div>
                <div className="text-2xl font-black text-rose-600 mt-1">
                  -{weekStats.totalPenaltyPoints}đ
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Điểm trừ vi phạm nề nếp Tuần {selectedWeek}
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <TrendingDown size={24} />
              </div>
            </div>

            {/* Card 3: Tổng điểm cộng */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Điểm Cộng</div>
                <div className="text-2xl font-black text-emerald-600 mt-1">
                  +{weekStats.totalBonusPoints}đ
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Điểm thưởng hoa điểm tốt & phong trào
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp size={24} />
              </div>
            </div>

            {/* Card 4: Tổng số lượt biên bản */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Lượt Ghi Nhận</div>
                <div className="text-2xl font-black text-slate-800 mt-1">
                  {weekStats.totalEntries} lượt
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Tình trạng: <strong>{weekLocked ? '🔒 Đã chốt khóa' : '🟢 Đang mở chấm'}</strong>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
            </div>
          </div>

          {/* Two-Column Grid: Top Classes & Low Score Classes & Common Errors */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Top Classes & Low Score Classes (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              {/* TOP LỚP DẪN ĐẦU TUẦN */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    <Award size={18} className="text-yellow-500" />
                    <span>Top Lớp Dẫn Đầu Tuần {selectedWeek}</span>
                  </h3>
                  <span className="text-[11px] text-slate-500 font-semibold">Khởi điểm 100đ</span>
                </div>

                <div className="space-y-2">
                  {weekStats.topClasses.map((item, index) => {
                    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
                    return (
                      <div
                        key={item.classItem.id}
                        className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-base">{medals[index] || `#${index + 1}`}</span>
                          <div>
                            <div className="font-extrabold text-slate-900 text-sm">{item.classItem.name}</div>
                            <div className="text-[11px] text-slate-500">{item.campus.name}</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-base font-black text-indigo-700">{item.totalScore}đ</div>
                          <div className="text-[10px] text-emerald-600 font-bold">
                            +{item.bonusPoints}đ / -{item.penaltyPoints}đ
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* LỚP ĐANG CÓ ĐIỂM THẤP / CẦN CHẤN CHỈNH */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-rose-700 flex items-center gap-2">
                    <AlertTriangle size={18} className="text-rose-600" />
                    <span>Lớp Đang Có Điểm Thấp (Cảnh Báo Nề Nếp)</span>
                  </h3>
                  <span className="text-[11px] text-rose-600 font-semibold">Cần chấn chỉnh</span>
                </div>

                <div className="space-y-2">
                  {weekStats.lowClasses.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      Tất cả các lớp đều duy trì điểm số trên 95đ rất tốt!
                    </div>
                  ) : (
                    weekStats.lowClasses.map((item) => (
                      <div
                        key={item.classItem.id}
                        className="p-3 rounded-xl bg-rose-50/60 border border-rose-200 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-extrabold text-rose-950 text-sm">{item.classItem.name}</div>
                          <div className="text-[11px] text-slate-600">
                            {item.campus.name} • Trừ trong tuần: <strong>-{item.penaltyPoints}đ</strong>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-base font-black text-rose-700">{item.totalScore}đ</div>
                          <div className="text-[10px] text-rose-500 font-bold">Hạng #{item.rank}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right: Các lỗi vi phạm phổ biến nhất (6 cols) */}
            <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <TrendingDown size={18} className="text-rose-600" />
                  <span>Các Lỗi Vi Phạm Phổ Biến Nhất Tuần {selectedWeek}</span>
                </h3>
                <span className="text-[11px] text-slate-500 font-semibold">Thống kê tần suất</span>
              </div>

              <div className="space-y-4">
                {commonErrors.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    Chưa ghi nhận vi phạm nào trong tuần này.
                  </div>
                ) : (
                  commonErrors.map((err, idx) => {
                    const maxCount = commonErrors[0]?.count || 1;
                    const percent = Math.round((err.count / maxCount) * 100);
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-rose-100 text-rose-800 flex items-center justify-center text-[10px] font-black">
                              {idx + 1}
                            </span>
                            <span>{err.name}</span>
                          </span>
                          <span className="font-extrabold text-slate-900">
                            {err.count} lượt <span className="text-rose-600">(-{err.totalPenalty}đ)</span>
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-amber-500 to-rose-600 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* LỊCH SỬ VI PHẠM & NHẬT KÝ NGƯỜI NHẬP (FULL AUDIT TRAIL TABLE) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <FileSpreadsheet size={18} className="text-indigo-600" />
                  <span>Nhật Ký & Lịch Sử Ghi Nhận Điểm Tuần {selectedWeek}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Minh bạch toàn bộ biên bản, thời gian ghi nhận và danh tính người nhập liệu
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={auditCampusFilter}
                  onChange={(e) => setAuditCampusFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-semibold focus:ring-2 focus:ring-indigo-500 outline-hidden"
                >
                  <option value="all">Tất cả Phân hiệu</option>
                  {campuses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder="Lọc lớp, người ghi, lỗi..."
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Ngày</th>
                    <th className="py-2.5 px-3">Phân hiệu</th>
                    <th className="py-2.5 px-3">Lớp</th>
                    <th className="py-2.5 px-3">Tiêu chí vi phạm / Thành tích</th>
                    <th className="py-2.5 px-3">Số lượng</th>
                    <th className="py-2.5 px-3">Điểm</th>
                    <th className="py-2.5 px-3">Ghi chú cụ thể</th>
                    <th className="py-2.5 px-3">Người ghi nhận (Audit)</th>
                    {canManageLock && !weekLocked && <th className="py-2.5 px-3 text-right">Xóa</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-slate-400">
                        Không tìm thấy biên bản nào phù hợp với bộ lọc trong Tuần {selectedWeek}.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-500 font-medium">
                          {log.date || 'Tuần này'}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-700">
                          {log.campusName}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            {log.className}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                              {log.criteriaCode}
                            </span>
                            <span>{log.criteriaName}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-bold whitespace-nowrap">
                          {log.quantity}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className={`font-black ${log.totalPoints >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {log.totalPoints >= 0 ? `+${log.totalPoints}` : log.totalPoints}đ
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 italic max-w-xs truncate">
                          {log.note || log.calculationDetail || '—'}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="font-medium text-slate-800">
                            {log.inspectorName || log.recordedBy || 'Đội Cờ đỏ'}
                          </span>
                        </td>
                        {canManageLock && !weekLocked && (
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                            <button
                              onClick={() => {
                                if (confirm(`Xác nhận xóa biên bản này của lớp ${log.className}?`)) {
                                  deleteScoreLog(log.id);
                                }
                              }}
                              className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                              title="Xóa biên bản"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT RED FLAG DUTY ASSIGNMENT */}
      {/* --------------------------------------------------------------------------------- */}
      {showDutyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <Flag size={18} className="text-indigo-600" />
                <span>{editingDutyId ? 'Chỉnh Sửa Ca Trực Cờ Đỏ' : 'Phân Công Ca Trực Cờ Đỏ Mới'}</span>
              </h3>
              <button
                onClick={() => setShowDutyModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveDuty} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                {/* Week */}
                <div>
                  <label className="font-bold text-slate-700">Tuần thực hiện:</label>
                  <div className="mt-1 p-2 bg-slate-100 rounded-lg font-bold text-indigo-700">
                    Tuần {selectedWeek}
                  </div>
                </div>

                {/* Day of Week */}
                <div>
                  <label className="font-bold text-slate-700">Thứ trong tuần:</label>
                  <select
                    value={dutyFormData.dayOfWeek}
                    onChange={(e) => setDutyFormData({ ...dutyFormData, dayOfWeek: e.target.value as RedFlagDuty['dayOfWeek'] })}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                  >
                    {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Campus */}
              <div>
                <label className="font-bold text-slate-700">Phân hiệu:</label>
                <select
                  value={dutyFormData.campusId}
                  onChange={(e) => {
                    const nextCampusId = e.target.value;
                    const defaultClass = classes.find((c) => c.campusId === nextCampusId);
                    setDutyFormData({
                      ...dutyFormData,
                      campusId: nextCampusId,
                      assignedClassId: defaultClass ? defaultClass.id : '',
                    });
                  }}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                >
                  {campuses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Assigned Class */}
              <div>
                <label className="font-bold text-slate-700">Lớp chịu trách nhiệm trực Cờ Đỏ:</label>
                <select
                  value={dutyFormData.assignedClassId}
                  onChange={(e) => setDutyFormData({ ...dutyFormData, assignedClassId: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-indigo-700"
                  required
                >
                  <option value="">-- Chọn lớp trực --</option>
                  {classes
                    .filter((c) => c.campusId === dutyFormData.campusId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>Lớp {c.name} (Khối {c.grade})</option>
                    ))}
                </select>
              </div>

              {/* Student Inspector Names */}
              <div>
                <label className="font-bold text-slate-700">Họ và tên các học sinh trực:</label>
                <input
                  type="text"
                  value={dutyFormData.inspectorNames}
                  onChange={(e) => setDutyFormData({ ...dutyFormData, inspectorNames: e.target.value })}
                  placeholder="VD: Lê Hải Đăng, Nguyễn Thu Hà..."
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                  required
                />
              </div>

              {/* Area */}
              <div>
                <label className="font-bold text-slate-700">Khu vực phân công kiểm tra:</label>
                <input
                  type="text"
                  value={dutyFormData.dutyArea}
                  onChange={(e) => setDutyFormData({ ...dutyFormData, dutyArea: e.target.value })}
                  placeholder="VD: Khu phòng học Khối 8, Cổng trường, Căng tin..."
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                  required
                />
              </div>

              {/* Notes */}
              <div>
                <label className="font-bold text-slate-700">Nhiệm vụ trọng tâm / Lưu ý:</label>
                <textarea
                  rows={2}
                  value={dutyFormData.notes}
                  onChange={(e) => setDutyFormData({ ...dutyFormData, notes: e.target.value })}
                  placeholder="VD: Kiểm tra sơ vin đầu giờ, trật tự 15 phút truy bài..."
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDutyModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-xs cursor-pointer"
                >
                  Lưu phân công
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------------------- */}
      {/* MODAL: CONFIRM WEEK LOCK / UNLOCK */}
      {/* --------------------------------------------------------------------------------- */}
      {showLockConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                weekLocked ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'
              }`}>
                {weekLocked ? <Unlock size={24} /> : <Lock size={24} />}
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {weekLocked ? `Mở Khóa Số Liệu Tuần ${selectedWeek}?` : `Chốt Số Liệu & Khóa Tuần ${selectedWeek}?`}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Quyền thực thi của Tổng Phụ Trách Đội & Ban Giám Hiệu
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              {weekLocked ? (
                <span>
                  Khi mở khóa, giáo viên, Đội cờ đỏ và giám thị có thể tiếp tục cập nhật, chỉnh sửa điểm số và biên bản thi đua của Tuần {selectedWeek}.
                </span>
              ) : (
                <span>
                  Sau khi khóa, toàn bộ điểm số của {classes.length} lớp trong Tuần {selectedWeek} sẽ được đóng băng. Hệ thống sẽ không cho phép bất kỳ ai nhập thêm hoặc sửa đổi vi phạm cho đến khi có lệnh mở khóa lại.
                </span>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLockConfirmModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleToggleLock}
                className={`px-5 py-2 rounded-lg text-xs font-black text-white shadow-xs cursor-pointer ${
                  weekLocked ? 'bg-amber-600 hover:bg-amber-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {weekLocked ? 'Xác nhận Mở Khóa' : 'Xác nhận Khóa Chốt'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
