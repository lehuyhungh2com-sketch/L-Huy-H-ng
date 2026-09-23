import React from 'react';
import { useApp } from '../../context/AppContext';
import { ClassItem, RankingEntry } from '../../types';
import { X, Award, AlertTriangle, Plus, Minus, Calendar, UserCheck, ShieldCheck, Zap } from 'lucide-react';

interface ClassDetailModalProps {
  classItem: ClassItem | null;
  rankingEntry?: RankingEntry | null;
  week: number;
  onClose: () => void;
}

export const ClassDetailModal: React.FC<ClassDetailModalProps> = ({
  classItem,
  rankingEntry,
  week,
  onClose,
}) => {
  const { scoreLogs, campuses, getClassWeeklyScore } = useApp();

  if (!classItem) return null;

  const campus = campuses.find((c) => c.id === classItem.campusId);
  const weekLogs = scoreLogs.filter(
    (l) => l.classId === classItem.id && (l.week === week || (l.period !== 'week' && l.period !== undefined))
  );
  const scoreInfo = getClassWeeklyScore(classItem.id, week);

  const bonusLogs = weekLogs.filter((l) => l.type === 'bonus' || l.totalPoints > 0);
  const penaltyLogs = weekLogs.filter((l) => l.type === 'penalty' || l.totalPoints < 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">
                Chi tiết thi đua Lớp {classItem.name}
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                Khối {classItem.grade}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                {classItem.name.endsWith('A1')
                  ? 'Lớp chọn A1'
                  : classItem.name.endsWith('A2') || classItem.name.endsWith('A3')
                  ? 'Lớp A2, A3'
                  : 'Lớp chuẩn phân hiệu'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Phân hiệu: <strong className="text-slate-700">{campus?.name}</strong> ({campus?.type === 'main' ? 'Trường chính' : 'Phân hiệu'}) · GVCN: <strong className="text-slate-700">{classItem.homeroomTeacher}</strong> · Tuần {week}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Score Summary Ribbon */}
        <div className="grid grid-cols-4 border-b border-slate-200 bg-white p-4 text-center divide-x divide-slate-100">
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Điểm gốc</div>
            <div className="text-lg font-bold text-slate-700 tabular-nums">100</div>
          </div>
          <div>
            <div className="text-[11px] text-emerald-600 font-medium">Điểm thưởng (+)</div>
            <div className="text-lg font-bold text-emerald-600 tabular-nums">+{scoreInfo.bonusPoints}</div>
          </div>
          <div>
            <div className="text-[11px] text-rose-600 font-medium">Điểm trừ (-)</div>
            <div className="text-lg font-bold text-rose-600 tabular-nums">-{scoreInfo.penaltyPoints}</div>
          </div>
          <div className="bg-indigo-50/50 rounded-r-lg">
            <div className="text-[11px] text-indigo-700 font-semibold">Tổng điểm tuần</div>
            <div className="text-xl font-extrabold text-indigo-700 tabular-nums">{scoreInfo.finalScore}</div>
          </div>
        </div>

        {/* Content: List of Logs */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Bonus List */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
                <Award size={16} />
                <span>Thành tích & Điểm cộng ({bonusLogs.length})</span>
              </div>
              <span className="text-xs text-emerald-600 font-semibold tabular-nums">
                Tổng cộng: +{scoreInfo.bonusPoints} điểm
              </span>
            </div>

            {bonusLogs.length === 0 ? (
              <div className="p-3 text-center rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500">
                Chưa có điểm cộng ghi nhận trong tuần này.
              </div>
            ) : (
              <div className="space-y-2">
                {bonusLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/40 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        <span className="font-mono text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded text-[10px] font-bold">
                          {log.criteriaCode}
                        </span>
                        <span>{log.criteriaName}</span>
                        {log.period && log.period !== 'week' && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">
                            {log.period === 'month' ? 'Điểm Tháng' : 'Điểm Cả Năm'}
                          </span>
                        )}
                      </div>
                      {log.calculationDetail && (
                        <div className="text-[11px] text-indigo-800 font-medium flex items-center gap-1">
                          <Zap size={12} className="text-indigo-600 shrink-0" />
                          <span>{log.calculationDetail}</span>
                        </div>
                      )}
                      {log.note && (
                        <p className="text-slate-600 italic text-[11px]">"{log.note}"</p>
                      )}
                      <div className="text-[10px] text-slate-500 flex items-center gap-2">
                        <span>Ngày: {log.date}</span>
                        <span>·</span>
                        <span>Người ghi: {log.recordedBy} ({log.inspectorName})</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-emerald-700 tabular-nums text-sm">
                        +{log.totalPoints}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        ({log.quantity} {log.quantity > 1 ? 'lần/tiết' : ''})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Penalty List */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-700">
                <AlertTriangle size={16} />
                <span>Lỗi vi phạm & Điểm trừ ({penaltyLogs.length})</span>
              </div>
              <span className="text-xs text-rose-600 font-semibold tabular-nums">
                Tổng trừ: -{scoreInfo.penaltyPoints} điểm
              </span>
            </div>

            {penaltyLogs.length === 0 ? (
              <div className="p-3 text-center rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs text-emerald-700 font-medium">
                Tuyệt vời! Lớp không có lỗi vi phạm nào bị ghi nhận trong tuần này.
              </div>
            ) : (
              <div className="space-y-2">
                {penaltyLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl border border-rose-100 bg-rose-50/40 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        <span className="font-mono text-rose-700 bg-rose-100/70 px-1.5 py-0.5 rounded text-[10px] font-bold">
                          {log.criteriaCode}
                        </span>
                        <span>{log.criteriaName}</span>
                        {log.isDisciplinary && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-rose-200 text-rose-900 rounded font-bold">
                            Hạ hạnh kiểm / Kỷ luật
                          </span>
                        )}
                      </div>
                      {log.calculationDetail && (
                        <div className="text-[11px] text-rose-900 font-medium flex items-center gap-1">
                          <Zap size={12} className="text-rose-600 shrink-0" />
                          <span>{log.calculationDetail}</span>
                        </div>
                      )}
                      {log.note && (
                        <p className="text-slate-600 italic text-[11px]">"{log.note}"</p>
                      )}
                      <div className="text-[10px] text-slate-500 flex items-center gap-2">
                        <span>Ngày: {log.date}</span>
                        <span>·</span>
                        <span>Người ghi: {log.recordedBy} ({log.inspectorName})</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-rose-700 tabular-nums text-sm">
                        {log.totalPoints}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        ({log.quantity} {log.quantity > 1 ? 'lần/học sinh' : ''})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Sĩ số: {classItem.studentCount} HS · Lớp trưởng: {classItem.monitorName}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
