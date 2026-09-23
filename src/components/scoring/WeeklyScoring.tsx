import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  PenTool,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  AlertCircle,
  Calendar,
  School,
  BookOpen,
  Filter,
  Layers,
  Sparkles,
  Info,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { Criteria, ScoreLog, CriteriaPeriod } from '../../types';
import { canInputScores, ROLE_METADATA } from '../../utils/rbac';

export const WeeklyScoring: React.FC = () => {
  const {
    campuses,
    classes,
    criteria,
    scoreLogs,
    selectedWeek,
    setSelectedWeek,
    currentUser,
    userRole,
    lockedWeeks,
    isWeekLocked,
    addScoreLog,
    deleteScoreLog,
    bulkAddScoreLogs,
    getClassWeeklyScore,
    previewCriteriaCalculation,
  } = useApp();

  const isLocked = isWeekLocked(selectedWeek);

  // Filters for class selection
  const [selectedCampusId, setSelectedCampusId] = useState<string>(
    currentUser.campusId || campuses[0]?.id || 'lhl_main'
  );
  const [selectedClassId, setSelectedClassId] = useState<string>(() => {
    if (currentUser.classId) return currentUser.classId;
    const campusClasses = classes.filter((c) => c.campusId === (currentUser.campusId || campuses[0]?.id));
    return campusClasses[0]?.id || classes[0]?.id || '';
  });

  // Entry Form State
  const [selectedCriteriaId, setSelectedCriteriaId] = useState<string>(criteria[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');
  const [customInspectorName, setCustomInspectorName] = useState<string>(currentUser.name);
  const [customPeriod, setCustomPeriod] = useState<CriteriaPeriod | 'auto'>('auto');

  // Bulk Quick Entry Modal State
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkCriteriaId, setBulkCriteriaId] = useState<string>(criteria[0]?.id || '');
  const [bulkSelectedClasses, setBulkSelectedClasses] = useState<Record<string, number>>({});
  const [bulkNote, setBulkNote] = useState<string>('');

  // Available classes for selected campus
  const campusClasses = useMemo(() => {
    return classes.filter((c) => c.campusId === selectedCampusId);
  }, [classes, selectedCampusId]);

  // Selected Class object
  const currentClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId) || campusClasses[0] || classes[0];
  }, [classes, selectedClassId, campusClasses]);

  // Selected Criteria object
  const currentCriteria = useMemo(() => {
    return criteria.find((c) => c.id === selectedCriteriaId) || criteria[0];
  }, [criteria, selectedCriteriaId]);

  // Real-time calculation preview
  const previewResult = useMemo(() => {
    if (!currentClass || !currentCriteria) return null;
    return previewCriteriaCalculation(currentCriteria.id, quantity, currentClass.id);
  }, [currentClass, currentCriteria, quantity, previewCriteriaCalculation]);

  // Score summary for current class in selected week
  const scoreSummary = useMemo(() => {
    if (!currentClass) return { baseScore: 100, bonusPoints: 0, penaltyPoints: 0, finalScore: 100, logCount: 0 };
    return getClassWeeklyScore(currentClass.id, selectedWeek);
  }, [currentClass, selectedWeek, getClassWeeklyScore]);

  // Logs for current class in selected week or month/year
  const classLogs = useMemo(() => {
    if (!currentClass) return [];
    return scoreLogs.filter(
      (l) =>
        l.classId === currentClass.id &&
        (l.week === selectedWeek || (l.period !== 'week' && l.period !== undefined))
    );
  }, [scoreLogs, currentClass, selectedWeek]);

  // RBAC Permission Check for scoring
  const scoringPermission = useMemo(() => {
    return canInputScores(
      currentUser,
      currentClass?.campusId,
      currentClass?.id,
      selectedWeek,
      lockedWeeks
    );
  }, [currentUser, currentClass, selectedWeek, lockedWeeks]);

  const canScore = scoringPermission.allowed;

  // Handle single log addition
  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClass || !currentCriteria || !previewResult) return;

    if (!scoringPermission.allowed) {
      alert(scoringPermission.reason);
      return;
    }

    if (!previewResult.applicable) {
      if (!confirm(`Tiêu chí này không khuyến nghị cho lớp ${currentClass.name} (${previewResult.reason}). Bạn vẫn muốn ghi nhận?`)) {
        return;
      }
    }

    const effectivePeriod = customPeriod === 'auto' ? previewResult.period : customPeriod;

    addScoreLog({
      week: selectedWeek,
      period: effectivePeriod,
      classId: currentClass.id,
      className: currentClass.name,
      campusId: currentClass.campusId,
      campusName: previewResult.campus?.name || '',
      campusType: previewResult.campus?.type || 'sub',
      grade: currentClass.grade,
      criteriaId: currentCriteria.id,
      criteriaCode: currentCriteria.code,
      criteriaName: currentCriteria.name,
      category: currentCriteria.category,
      type: currentCriteria.type,
      pointsPerUnit: previewResult.pointsPerUnit,
      quantity,
      totalPoints: previewResult.totalPoints,
      appliedCap: previewResult.appliedCap,
      calculationDetail: previewResult.calculationDetail,
      note: note.trim() || undefined,
      date,
      recordedBy: currentUser.title,
      inspectorName: customInspectorName || currentUser.name,
      isDisciplinary: previewResult.isDisciplinary,
    });

    // Reset form fields
    setNote('');
    setQuantity(1);
  };

  // Handle bulk scoring
  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const crit = criteria.find((c) => c.id === bulkCriteriaId);
    if (!crit) return;

    const entries: Omit<ScoreLog, 'id'>[] = [];
    Object.entries(bulkSelectedClasses).forEach(([clsId, qty]) => {
      if (qty > 0) {
        const cls = classes.find((c) => c.id === clsId);
        if (cls) {
          const calc = previewCriteriaCalculation(crit.id, qty, cls.id);
          entries.push({
            week: selectedWeek,
            period: crit.period,
            classId: cls.id,
            className: cls.name,
            campusId: cls.campusId,
            campusName: calc.campus?.name || '',
            campusType: calc.campus?.type || 'sub',
            grade: cls.grade,
            criteriaId: crit.id,
            criteriaCode: crit.code,
            criteriaName: crit.name,
            category: crit.category,
            type: crit.type,
            pointsPerUnit: calc.pointsPerUnit,
            quantity: qty,
            totalPoints: calc.totalPoints,
            appliedCap: calc.appliedCap,
            calculationDetail: calc.calculationDetail,
            note: bulkNote.trim() || undefined,
            date,
            recordedBy: currentUser.title,
            inspectorName: currentUser.name,
            isDisciplinary: calc.isDisciplinary,
          });
        }
      }
    });

    if (entries.length > 0) {
      bulkAddScoreLogs(entries);
      setBulkSelectedClasses({});
      setBulkNote('');
      setShowBulkModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Selection bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-1">
              <PenTool size={16} />
              <span>Chấm điểm & Giám thị</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Sổ Chấm Điểm & Ghi Nhận Thi Đua
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Hệ thống tự động tính điểm theo lớp A1, A2/A3, khối 9, phân hiệu và áp dụng trần điểm theo đúng quyết định.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Week Selector */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <Calendar size={16} className="text-slate-500" />
              <span className="text-xs font-semibold text-slate-600">Tuần:</span>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(Number(e.target.value))}
                className="text-xs sm:text-sm font-bold text-indigo-700 bg-transparent focus:outline-hidden cursor-pointer"
              >
                {Array.from({ length: 35 }, (_, i) => i + 1).map((w) => (
                  <option key={w} value={w}>
                    Tuần {w}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Bulk Button */}
            {canScore && (
              <button
                disabled={isLocked}
                onClick={() => setShowBulkModal(true)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer ${
                  isLocked ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-900 text-white'
                }`}
              >
                <Sparkles size={16} className={isLocked ? 'text-slate-400' : 'text-amber-400'} />
                <span>Nhập nhanh nhiều lớp</span>
              </button>
            )}
          </div>
        </div>

        {/* RBAC Permission / Lock Warning Banner */}
        {!scoringPermission.allowed && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center gap-2.5 text-xs text-amber-900 font-semibold">
            <AlertTriangle size={16} className="text-amber-600 shrink-0" />
            <span>{scoringPermission.reason}</span>
          </div>
        )}

        {/* Campus & Class Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-200">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <School size={14} className="text-indigo-600" />
              <span>Bước 1: Chọn Phân hiệu</span>
            </label>
            <select
              value={selectedCampusId}
              onChange={(e) => {
                setSelectedCampusId(e.target.value);
                const nextClasses = classes.filter((c) => c.campusId === e.target.value);
                if (nextClasses[0]) setSelectedClassId(nextClasses[0].id);
              }}
              className="w-full text-xs sm:text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              {campuses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type === 'main' ? 'Trường chính' : 'Phân hiệu'}) - {classes.filter((cl) => cl.campusId === c.id).length} lớp
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <BookOpen size={14} className="text-indigo-600" />
              <span>Bước 2: Chọn Lớp học để chấm điểm</span>
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full text-xs sm:text-sm font-bold text-indigo-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              {campusClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  Lớp {cls.name} (Khối {cls.grade} · GVCN: {cls.homeroomTeacher})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Class Live Emulation Card */}
      {currentClass && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black text-slate-900">
                  Lớp {currentClass.name}
                </h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Khối {currentClass.grade}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  {currentClass.name.endsWith('A1')
                    ? 'Lớp chọn A1 trường chính'
                    : currentClass.name.endsWith('A2') || currentClass.name.endsWith('A3')
                    ? 'Lớp A2, A3 trường chính'
                    : 'Lớp chuẩn phân hiệu'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                GVCN: <strong className="text-slate-700">{currentClass.homeroomTeacher}</strong> · Lớp trưởng:{' '}
                <strong className="text-slate-700">{currentClass.monitorName}</strong> · Sĩ số:{' '}
                <strong>{currentClass.studentCount} HS</strong> · Phòng: {currentClass.roomNumber || '---'}
              </p>
            </div>

            {/* Live Score Display */}
            <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <div className="text-center px-2">
                <div className="text-[10px] text-slate-500 font-medium">Điểm gốc</div>
                <div className="text-base font-bold text-slate-700 tabular-nums">100</div>
              </div>
              <span className="text-slate-300 font-light">+</span>
              <div className="text-center px-2">
                <div className="text-[10px] text-emerald-600 font-medium">Thưởng tuần</div>
                <div className="text-base font-bold text-emerald-600 tabular-nums">
                  +{scoreSummary.bonusPoints}
                </div>
              </div>
              <span className="text-slate-300 font-light">-</span>
              <div className="text-center px-2">
                <div className="text-[10px] text-rose-600 font-medium">Phạt tuần</div>
                <div className="text-base font-bold text-rose-600 tabular-nums">
                  -{scoreSummary.penaltyPoints}
                </div>
              </div>
              <span className="text-slate-300 font-light">=</span>
              <div className="text-center px-3 py-1 bg-indigo-600 rounded-lg text-white">
                <div className="text-[10px] uppercase font-bold text-indigo-200">Điểm Tuần {selectedWeek}</div>
                <div className="text-lg font-black tabular-nums">{scoreSummary.finalScore} đ</div>
              </div>
            </div>
          </div>

          {/* Scoring Form */}
          {canScore && (
            <form onSubmit={handleAddLog} className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Plus size={15} className="text-indigo-600" />
                  <span>Ghi nhận điểm thi đua cho lớp {currentClass.name}</span>
                </div>
                {previewResult && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                      previewResult.applicable ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {previewResult.applicable ? 'Hợp lệ theo quy chế' : previewResult.reason}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Criteria Selector */}
                <div className="lg:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Tiêu chí áp dụng *
                  </label>
                  <select
                    value={selectedCriteriaId}
                    onChange={(e) => setSelectedCriteriaId(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    {criteria
                      .filter((c) => c.isActive)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          [{c.code}] ({c.type === 'bonus' ? '+' : '-'}{c.points}đ/{c.unit} · {c.period === 'week' ? 'Tuần' : c.period === 'month' ? 'Tháng' : 'Năm'}) {c.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* 2. Quantity */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Số lượng ({currentCriteria?.unit || 'lần'}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* 3. Date */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Ngày ghi nhận *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Dynamic Preview Banner */}
              {previewResult && (
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                    previewResult.totalPoints > 0
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                      : previewResult.totalPoints < 0
                      ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-bold flex items-center gap-1.5">
                      <Zap size={14} className="shrink-0" />
                      <span>Công thức tự động: {previewResult.calculationDetail}</span>
                    </div>
                    <div className="text-[11px] opacity-80">
                      Chu kỳ:{' '}
                      <strong>
                        {previewResult.period === 'week'
                          ? 'Cộng/Trừ vào Điểm Tuần'
                          : previewResult.period === 'month'
                          ? 'Cộng/Trừ vào Điểm Tháng'
                          : 'Cộng/Trừ vào Điểm Cả Năm'}
                      </strong>{' '}
                      {previewResult.appliedCap !== undefined && `· Trần điểm: ${previewResult.appliedCap}đ`}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-lg font-black block tabular-nums">
                      {previewResult.totalPoints > 0
                        ? `+${previewResult.totalPoints}`
                        : previewResult.totalPoints}{' '}
                      đ
                    </span>
                  </div>
                </div>
              )}

              {/* Note & Inspector */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Ghi chú chi tiết (Họ tên học sinh, tiết học, bối cảnh vi phạm/khen thưởng)
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="VD: Em Trần Bảo An vi phạm; Tiết 2 môn Hóa đạt điểm 10..."
                    className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Người chấm / Đội kiểm tra
                  </label>
                  <input
                    type="text"
                    value={customInspectorName}
                    onChange={(e) => setCustomInspectorName(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Submit button */}
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={!scoringPermission.allowed}
                  className={`flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer ${
                    !scoringPermission.allowed
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  <CheckCircle2 size={16} />
                  <span>
                    {!scoringPermission.allowed
                      ? scoringPermission.reason
                      : `Xác nhận ghi điểm cho lớp ${currentClass.name}`}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* History logs table */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Lịch sử ghi điểm lớp {currentClass.name} (Tuần {selectedWeek} & Sự kiện mở rộng)
              </h4>
              <span className="text-xs text-slate-500 font-medium">
                {classLogs.length} bản ghi
              </span>
            </div>

            {classLogs.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-500">Chưa có ghi nhận thi đua nào cho lớp này trong tuần {selectedWeek}.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Chu kỳ</th>
                      <th className="py-2.5 px-3">Mã & Tiêu chí</th>
                      <th className="py-2.5 px-3 text-center">Số lượng</th>
                      <th className="py-2.5 px-3 text-center">Điểm</th>
                      <th className="py-2.5 px-3">Công thức tính</th>
                      <th className="py-2.5 px-3">Ghi chú</th>
                      <th className="py-2.5 px-3">Người ghi</th>
                      {canScore && <th className="py-2.5 px-3 text-center">Xóa</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {classLogs.map((log) => {
                      const isBonus = log.totalPoints > 0;
                      return (
                        <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                log.period === 'week'
                                  ? 'bg-cyan-100 text-cyan-800'
                                  : log.period === 'month'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {log.period === 'week' ? 'Tuần' : log.period === 'month' ? 'Tháng' : 'Năm'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-800">
                              <span className="font-mono text-indigo-700 font-black mr-1.5">
                                [{log.criteriaCode}]
                              </span>
                              {log.criteriaName}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {log.category} · {log.date}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                            {log.quantity}
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <span
                              className={`font-black px-2 py-0.5 rounded-md text-xs ${
                                isBonus ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                              }`}
                            >
                              {isBonus ? `+${log.totalPoints}` : `${log.totalPoints}`} đ
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                            {log.calculationDetail || `${log.quantity} x ${log.pointsPerUnit}đ`}
                            {log.appliedCap !== undefined && (
                              <span className="block text-[10px] text-amber-700 font-bold">
                                Trần: {log.appliedCap}đ
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 max-w-xs">
                            {log.note || '---'}
                            {log.isDisciplinary && (
                              <span className="block text-[10px] font-bold text-rose-600">
                                ⚠ Kỷ luật toàn trường (Hạ hạnh kiểm)
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                            <div className="font-medium text-slate-700">{log.inspectorName}</div>
                            <div className="text-[10px]">{log.recordedBy}</div>
                          </td>
                          {canScore && (
                            <td className="py-2.5 px-3 text-center">
                              <button
                                onClick={() => {
                                  if (confirm('Bạn có chắc muốn xóa bản ghi điểm này?')) {
                                    deleteScoreLog(log.id);
                                  }
                                }}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bulk Scoring Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="text-amber-500" size={20} />
                  <span>Nhập Nhanh Nhiều Lớp Cùng Tiêu Chí</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Áp dụng nhanh một tiêu chí cho danh sách các lớp trong phân hiệu{' '}
                  <strong className="text-slate-800">
                    {campuses.find((c) => c.id === selectedCampusId)?.name}
                  </strong>
                </p>
              </div>
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBulkSubmit} className="space-y-4">
              {/* Select Criteria */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chọn tiêu chí áp dụng
                </label>
                <select
                  value={bulkCriteriaId}
                  onChange={(e) => setBulkCriteriaId(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-indigo-500"
                >
                  {criteria
                    .filter((c) => c.isActive)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        [{c.code}] ({c.type === 'bonus' ? '+' : '-'}{c.points}đ/{c.unit}) {c.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Class grid */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Nhập số lượng cho từng lớp (để 0 nếu không vi phạm / không có thành tích):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-60 overflow-y-auto p-1">
                  {campusClasses.map((cls) => {
                    const qty = bulkSelectedClasses[cls.id] || 0;
                    return (
                      <div
                        key={cls.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                          qty > 0 ? 'bg-indigo-50/70 border-indigo-300' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <span className="text-xs font-bold text-slate-800">Lớp {cls.name}</span>
                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={qty}
                          onChange={(e) => {
                            const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                            setBulkSelectedClasses((prev) => ({ ...prev, [cls.id]: val }));
                          }}
                          className="w-14 text-center text-xs font-bold bg-white border border-slate-200 rounded-lg py-1 focus:outline-indigo-500"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú chung</label>
                <input
                  type="text"
                  value={bulkNote}
                  onChange={(e) => setBulkNote(e.target.value)}
                  placeholder="Ghi chú đợt kiểm tra..."
                  className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Xác nhận lưu cho các lớp đã chọn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
