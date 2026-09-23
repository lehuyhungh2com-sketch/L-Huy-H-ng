import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings as SettingsIcon,
  Save,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  School,
  Calculator,
  Calendar,
  Sliders,
  Sparkles,
  ShieldCheck,
  Scale,
  FileSpreadsheet,
} from 'lucide-react';
import { EvaluationConfig } from '../../types';
import { RegulationAuditModal } from '../compliance/RegulationAuditModal';
import { BackupExcelCenterModal } from '../backup/BackupExcelCenterModal';

export const SettingsManager: React.FC = () => {
  const {
    settings,
    classes,
    updateSettings,
    resetToDefaultData,
    exportDataBackup,
    importDataBackup,
    currentUser,
    academicYearArchives,
  } = useApp();

  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);

  // Basic settings
  const [schoolName, setSchoolName] = useState(settings.schoolName);
  const [academicYear, setAcademicYear] = useState(settings.academicYear);
  const [basePoints, setBasePoints] = useState(settings.basePointsPerWeek);
  const [currentWeek, setCurrentWeek] = useState(settings.currentWeek);
  const [formula, setFormula] = useState(settings.yearFormula);

  // Evaluation Rule Configs
  const [evalConfig, setEvalConfig] = useState<EvaluationConfig>(
    settings.evaluationConfig || {
      advancedClassesRatio: 0.7,
      excellentClassesRatio: 0.35,
      goodClassesRatio: 0.35,
      allowMainCampusExceed70: true,
      mainWeakBaseThreshold: 2,
      mainWeakBasePoints: 1,
      mainWeakStepPoints: 0.5,
      subWeakThreshold: 5,
      subWeakPenalty: 2,
      subWeakMaxCap: 2,
      mainA1GoodThreshold: 13,
      mainA2A3GoodThreshold: 10,
      subGoodThreshold: 5,
      goodScoreBonus: 2,
      goodScoreMaxCap: 2,
      dormitoryMaxCap: 3,
      ceremonyMaxCap: 0.5,
      lostFoundValueThreshold: 200000,
    }
  );

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      schoolName: schoolName.trim(),
      academicYear: academicYear.trim(),
      basePointsPerWeek: Number(basePoints),
      currentWeek: Number(currentWeek),
      yearFormula: formula.trim(),
      evaluationConfig: evalConfig,
    });
    setMessage({ text: 'Cấu hình hệ thống và tỷ lệ thi đua đã được lưu thành công!', type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDownloadBackup = () => {
    const dataStr = exportDataBackup();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `LHL_Ranking_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setMessage({ text: 'Đã xuất tệp sao lưu dữ liệu toàn hệ thống!', type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = importDataBackup(content);
        if (res.success) {
          setMessage({ text: res.message, type: 'success' });
        } else {
          setMessage({ text: res.message, type: 'error' });
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
    setTimeout(() => setMessage(null), 4000);
  };

  const handleResetData = () => {
    if (
      window.confirm(
        'Bạn có chắc chắn muốn đặt lại dữ liệu về cấu hình và dữ liệu mẫu gốc chuẩn PDF? Mọi dữ liệu mới thêm sẽ bị làm mới.'
      )
    ) {
      resetToDefaultData();
      setMessage({ text: 'Đã khôi phục toàn bộ dữ liệu mẫu gốc chuẩn 59 lớp thi đua!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const canManage = currentUser.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-1">
            <SettingsIcon size={16} />
            <span>Cài đặt hệ thống & Cấu hình Quy chế</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Cấu Hình Hệ Thống & Tỷ Lệ Xếp Loại Thi Đua
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Mọi tỷ lệ, giới hạn điểm (trần), định mức điểm yếu / điểm tốt, công thức năm học đều được cấu hình động tại đây.
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Save size={16} />
            <span>Lưu tất cả cấu hình</span>
          </button>
        )}
      </div>

      {/* Notification Message */}
      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* SECTION 1: Evaluation Rules & Thresholds */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-black text-base">
            <Sliders size={18} className="text-indigo-600" />
            <span>1. Tỷ Lệ Xếp Loại Thi Đua & Định Mức Điểm Cấu Hình Động</span>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
            Quyết định năm học {settings.academicYear}
          </span>
        </div>

        {/* 1.1 Classification Ratios */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            a. Tỷ lệ khống chế xếp loại thi đua cả năm (Theo Mục II Quyết định)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <label className="block text-xs font-bold text-slate-800">
                Tỷ lệ Lớp Tiên Tiến trở lên
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  disabled={!canManage}
                  value={Math.round(evalConfig.advancedClassesRatio * 100)}
                  onChange={(e) =>
                    setEvalConfig({
                      ...evalConfig,
                      advancedClassesRatio: Number(e.target.value) / 100,
                    })
                  }
                  className="w-20 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-black text-indigo-700 focus:outline-indigo-500"
                />
                <span className="text-xs font-bold text-slate-500">% tổng số lớp</span>
              </div>
              <p className="text-[11px] text-slate-500">Mặc định: 70% / tổng số lớp toàn trường</p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <label className="block text-xs font-bold text-slate-800">
                Tỷ lệ Lớp Xuất Sắc
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  disabled={!canManage}
                  value={Math.round(evalConfig.excellentClassesRatio * 100)}
                  onChange={(e) =>
                    setEvalConfig({
                      ...evalConfig,
                      excellentClassesRatio: Number(e.target.value) / 100,
                    })
                  }
                  className="w-20 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-black text-emerald-700 focus:outline-indigo-500"
                />
                <span className="text-xs font-bold text-slate-500">% trong chỉ tiêu</span>
              </div>
              <p className="text-[11px] text-slate-500">Mặc định: 35% của 70% lớp tiên tiến</p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <label className="block text-xs font-bold text-slate-800">
                Tỷ lệ Lớp Tiên Tiến
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  disabled={!canManage}
                  value={Math.round(evalConfig.goodClassesRatio * 100)}
                  onChange={(e) =>
                    setEvalConfig({
                      ...evalConfig,
                      goodClassesRatio: Number(e.target.value) / 100,
                    })
                  }
                  className="w-20 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-black text-blue-700 focus:outline-indigo-500"
                />
                <span className="text-xs font-bold text-slate-500">% trong chỉ tiêu</span>
              </div>
              <p className="text-[11px] text-slate-500">Mặc định: 35% của 70% lớp tiên tiến</p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <input
              type="checkbox"
              id="allowExceed"
              disabled={!canManage}
              checked={evalConfig.allowMainCampusExceed70}
              onChange={(e) =>
                setEvalConfig({ ...evalConfig, allowMainCampusExceed70: e.target.checked })
              }
              className="w-4 h-4 text-indigo-600 rounded-sm cursor-pointer"
            />
            <label htmlFor="allowExceed" className="text-xs font-bold text-slate-700 cursor-pointer">
              Riêng trường chính: Cho phép xem xét tỷ lệ HSG tỉnh và CLB để vượt mốc 70% nếu đạt chuẩn.
            </label>
          </div>
        </div>

        {/* 1.2 Good Score & Weak Score Dynamic Thresholds */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            b. Định mức Điểm Tốt & Điểm Yếu theo Trường chính vs Phân hiệu
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Lớp A1 Trường chính */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-indigo-600 block">Trường chính: Lớp chọn A1</span>
              <label className="block text-xs font-bold text-slate-800">
                Định mức Điểm tốt (9-10đ)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  disabled={!canManage}
                  value={evalConfig.mainA1GoodThreshold}
                  onChange={(e) =>
                    setEvalConfig({ ...evalConfig, mainA1GoodThreshold: Number(e.target.value) })
                  }
                  className="w-20 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold focus:outline-indigo-500"
                />
                <span className="text-xs text-slate-600 font-semibold">con điểm tốt / tuần</span>
              </div>
              <p className="text-[10px] text-slate-500">Lớp A1 đạt từ 13 con mới được cộng 2đ (max 2đ)</p>
            </div>

            {/* Lớp A2, A3 Trường chính */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-indigo-600 block">Trường chính: Lớp A2, A3</span>
              <label className="block text-xs font-bold text-slate-800">
                Định mức Điểm tốt (9-10đ)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  disabled={!canManage}
                  value={evalConfig.mainA2A3GoodThreshold}
                  onChange={(e) =>
                    setEvalConfig({ ...evalConfig, mainA2A3GoodThreshold: Number(e.target.value) })
                  }
                  className="w-20 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold focus:outline-indigo-500"
                />
                <span className="text-xs text-slate-600 font-semibold">con điểm tốt / tuần</span>
              </div>
              <p className="text-[10px] text-slate-500">Lớp A2, A3 đạt từ 10 con mới được cộng 2đ (max 2đ)</p>
            </div>

            {/* Các Phân hiệu */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-teal-600 block">Các Phân hiệu</span>
              <label className="block text-xs font-bold text-slate-800">
                Định mức Điểm tốt (9-10đ)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  disabled={!canManage}
                  value={evalConfig.subGoodThreshold}
                  onChange={(e) =>
                    setEvalConfig({ ...evalConfig, subGoodThreshold: Number(e.target.value) })
                  }
                  className="w-20 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold focus:outline-indigo-500"
                />
                <span className="text-xs text-slate-600 font-semibold">con điểm tốt / tuần</span>
              </div>
              <p className="text-[10px] text-slate-500">Phân hiệu đạt từ 5 con được cộng 2đ</p>
            </div>

            {/* Điểm yếu trường chính */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-rose-600 block">Trường chính: Điểm yếu</span>
              <label className="block text-xs font-bold text-slate-800">
                Bậc phạt điểm yếu
              </label>
              <div className="text-xs space-y-1 text-slate-700">
                <div className="flex items-center gap-1.5">
                  <span>Chạm mốc:</span>
                  <input
                    type="number"
                    min="1"
                    disabled={!canManage}
                    value={evalConfig.mainWeakBaseThreshold}
                    onChange={(e) =>
                      setEvalConfig({ ...evalConfig, mainWeakBaseThreshold: Number(e.target.value) })
                    }
                    className="w-12 px-1.5 py-0.5 bg-white border border-slate-200 rounded-md font-bold text-center"
                  />
                  <span>con trừ:</span>
                  <input
                    type="number"
                    step="0.5"
                    disabled={!canManage}
                    value={evalConfig.mainWeakBasePoints}
                    onChange={(e) =>
                      setEvalConfig({ ...evalConfig, mainWeakBasePoints: Number(e.target.value) })
                    }
                    className="w-12 px-1.5 py-0.5 bg-white border border-slate-200 rounded-md font-bold text-center"
                  />
                  <span>đ</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>Mỗi con tiếp theo trừ thêm:</span>
                  <input
                    type="number"
                    step="0.1"
                    disabled={!canManage}
                    value={evalConfig.mainWeakStepPoints}
                    onChange={(e) =>
                      setEvalConfig({ ...evalConfig, mainWeakStepPoints: Number(e.target.value) })
                    }
                    className="w-14 px-1.5 py-0.5 bg-white border border-slate-200 rounded-md font-bold text-center"
                  />
                  <span>đ</span>
                </div>
              </div>
            </div>

            {/* Điểm yếu phân hiệu */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-rose-600 block">Phân hiệu: Điểm yếu</span>
              <label className="block text-xs font-bold text-slate-800">
                Ngưỡng phạt & Trần phạt
              </label>
              <div className="text-xs space-y-1 text-slate-700">
                <div className="flex items-center gap-1.5">
                  <span>Ngưỡng trừ: Từ</span>
                  <input
                    type="number"
                    min="1"
                    disabled={!canManage}
                    value={evalConfig.subWeakThreshold}
                    onChange={(e) =>
                      setEvalConfig({ ...evalConfig, subWeakThreshold: Number(e.target.value) })
                    }
                    className="w-12 px-1.5 py-0.5 bg-white border border-slate-200 rounded-md font-bold text-center"
                  />
                  <span>con trở lên</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>Trừ:</span>
                  <input
                    type="number"
                    disabled={!canManage}
                    value={evalConfig.subWeakPenalty}
                    onChange={(e) =>
                      setEvalConfig({ ...evalConfig, subWeakPenalty: Number(e.target.value) })
                    }
                    className="w-12 px-1.5 py-0.5 bg-white border border-slate-200 rounded-md font-bold text-center"
                  />
                  <span>đ (Trần: {evalConfig.subWeakMaxCap}đ)</span>
                </div>
              </div>
            </div>

            {/* Bán trú & Đội nghi lễ */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-amber-600 block">Trần điểm đặc thù</span>
              <label className="block text-xs font-bold text-slate-800">
                Giới hạn Bán trú & Nghi lễ
              </label>
              <div className="text-xs space-y-1 text-slate-700">
                <div className="flex items-center justify-between">
                  <span>Trần trừ Bán trú:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      disabled={!canManage}
                      value={evalConfig.dormitoryMaxCap}
                      onChange={(e) =>
                        setEvalConfig({ ...evalConfig, dormitoryMaxCap: Number(e.target.value) })
                      }
                      className="w-14 px-1.5 py-0.5 bg-white border border-slate-200 rounded-md font-bold text-center"
                    />
                    <span>đ</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Trần Đội nghi lễ LĐ:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.1"
                      disabled={!canManage}
                      value={evalConfig.ceremonyMaxCap}
                      onChange={(e) =>
                        setEvalConfig({ ...evalConfig, ceremonyMaxCap: Number(e.target.value) })
                      }
                      className="w-14 px-1.5 py-0.5 bg-white border border-slate-200 rounded-md font-bold text-center"
                    />
                    <span>đ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: General School Settings */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center gap-2 text-slate-900 font-black text-base border-b border-slate-100 pb-3">
          <School size={18} className="text-indigo-600" />
          <span>2. Thông Tin Chung & Niên Khóa</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tên trường học</label>
            <input
              type="text"
              disabled={!canManage}
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Năm học</label>
            <input
              type="text"
              disabled={!canManage}
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Điểm gốc mỗi tuần (Base score)
            </label>
            <input
              type="number"
              disabled={!canManage}
              value={basePoints}
              onChange={(e) => setBasePoints(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold focus:outline-indigo-500"
            />
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Mặc định: 100 điểm khởi đầu mỗi tuần cho mỗi lớp
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tuần học hiện tại</label>
            <input
              type="number"
              min="1"
              max="35"
              disabled={!canManage}
              value={currentWeek}
              onChange={(e) => setCurrentWeek(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold focus:outline-indigo-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Calculator size={14} className="text-indigo-600" />
              <span>Công thức tính điểm cả năm</span>
            </label>
            <input
              type="text"
              disabled={!canManage}
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-bold text-indigo-800 focus:outline-indigo-500"
            />
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Quy chuẩn: (HK1 + HK2 * 2) / 3 + Điểm cộng cả năm (CLB văn hóa, Giải tỉnh K9, Đội nghi lễ).
            </span>
          </div>
        </div>

        {canManage && (
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Save size={16} />
              <span>Lưu thông tin cấu hình</span>
            </button>
          </div>
        )}
      </form>

      {/* SECTION 3: Multi-Year, Standby Excel, Backup & Restore */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-black text-base">
            <ShieldCheck size={18} className="text-indigo-600" />
            <span>3. Bảo Hiểm Dữ Liệu, Đa Năm Học & Rà Soát Quy Chuẩn</span>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
            Hoạt động độc lập
          </span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Đảm bảo công tác thi đua nề nếp của Nhà trường diễn ra thông suốt qua nhiều năm học. Hỗ trợ tạo năm học mới tự động chuyển tiếp khối, lưu trữ lịch sử, xuất sổ tính điểm tự động bằng Excel phòng ngừa mất mạng hoặc sự cố phần mềm.
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <FileSpreadsheet size={16} className="text-emerald-700" />
                  <span>Trung Tâm Xuất Excel & Đa Năm Học</span>
                </span>
                <span className="text-[10px] font-bold bg-white text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                  {academicYearArchives.length} năm lưu trữ
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                Xuất sổ chấm điểm & xếp loại offline độc lập với công thức tự động (=SUM, =RANK), quản lý chuyển tiếp năm học mới, sao lưu toàn bộ cơ sở dữ liệu.
              </p>
            </div>
            <button
              onClick={() => setShowBackupModal(true)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <FileSpreadsheet size={15} />
              <span>Mở Trung Tâm Xuất Excel & Đa Năm Học</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                  <Scale size={16} className="text-indigo-700" />
                  <span>Rà Soát Công Văn & Tính Toàn Vẹn</span>
                </span>
                <span className="text-[10px] font-bold bg-white text-indigo-800 px-2 py-0.5 rounded-full border border-indigo-200">
                  Chuẩn 100%
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                Tự động kiểm toán toàn vẹn 59 lớp của 6 phân hiệu, đối chiếu công văn trần bán trú ≤ 3đ, trần nghi lễ ≤ 0.5đ, quy tắc điểm yếu và các điều khoản kỷ luật.
              </p>
            </div>
            <button
              onClick={() => setShowAuditModal(true)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <Scale size={15} />
              <span>Kiểm Tra Quy Chuẩn & Rà Soát Công Văn</span>
            </button>
          </div>
        </div>

        {/* Quick Legacy Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <button
            onClick={handleDownloadBackup}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Download size={15} />
            <span>Tải tệp JSON sao lưu</span>
          </button>

          <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs">
            <Upload size={15} />
            <span>Phục hồi từ tệp JSON</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>

          {canManage && (
            <button
              onClick={handleResetData}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw size={15} />
              <span>Khôi phục dữ liệu mẫu gốc</span>
            </button>
          )}
        </div>
      </div>

      {/* Compliance Audit Modal */}
      <RegulationAuditModal isOpen={showAuditModal} onClose={() => setShowAuditModal(false)} />

      {/* Backup & Standby Excel Center Modal */}
      <BackupExcelCenterModal isOpen={showBackupModal} onClose={() => setShowBackupModal(false)} />
    </div>
  );
};
