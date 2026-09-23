import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sliders,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Award,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  Calendar,
  Layers,
  School,
  PlayCircle,
  Check,
  Zap,
} from 'lucide-react';
import {
  Criteria,
  CriteriaCategory,
  CriteriaType,
  CriteriaPeriod,
  CriteriaScope,
  CalculationRuleType,
} from '../../types';

export const CriteriaManager: React.FC = () => {
  const {
    criteria,
    addCriteria,
    updateCriteria,
    deleteCriteria,
    toggleCriteriaActive,
    campuses,
    classes,
    currentUser,
    previewCriteriaCalculation,
    settings,
  } = useApp();

  // Filters
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeType, setActiveType] = useState<'all' | 'bonus' | 'penalty'>('all');
  const [activePeriod, setActivePeriod] = useState<'all' | 'week' | 'month' | 'year'>('all');
  const [activeScope, setActiveScope] = useState<'all' | 'main_only' | 'sub_only'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Tab in Criteria Manager: 'list' | 'sandbox'
  const [activeViewTab, setActiveViewTab] = useState<'list' | 'sandbox'>('list');

  // Modal State for Add / Edit
  const [showModal, setShowModal] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState<Criteria | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CriteriaCategory>('Chất lượng học tập');
  const [type, setType] = useState<CriteriaType>('penalty');
  const [points, setPoints] = useState<number>(2);
  const [unit, setUnit] = useState<string>('lần');
  const [period, setPeriod] = useState<CriteriaPeriod>('week');
  const [scope, setScope] = useState<CriteriaScope>('all');
  const [targetGrades, setTargetGrades] = useState<string>(''); // e.g. "6,7,8"
  const [targetClassType, setTargetClassType] = useState<'all' | 'A1' | 'A2_A3'>('all');
  const [condition, setCondition] = useState('');
  const [maxCap, setMaxCap] = useState<string>('');
  const [calculationRule, setCalculationRule] = useState<CalculationRuleType>('standard');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState<boolean>(true);

  // Sandbox Tester State
  const [sandboxClassId, setSandboxClassId] = useState<string>(classes[0]?.id || '');
  const [sandboxCriteriaId, setSandboxCriteriaId] = useState<string>(criteria[0]?.id || '');
  const [sandboxQuantity, setSandboxQuantity] = useState<number>(1);

  const categories: CriteriaCategory[] = [
    'Chuyên cần',
    'Hành vi ứng xử',
    'Tác phong - Trang phục',
    'Sinh hoạt TT',
    'Lao động, vệ sinh',
    'Bảo vệ của công',
    'Trật tự ATGT',
    'Chất lượng học tập',
    'Quy chế thi',
    'Đóng góp – Sổ đầu bài',
    'Đội cờ đỏ',
    'Bán trú',
    'Học tập',
    'HS nhặt được của rơi',
    'Các hoạt động khác',
    'Lớp có HS đạt giải các kỳ thi',
  ];

  const filteredCriteria = useMemo(() => {
    return criteria.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) return false;
      if (activeType !== 'all' && item.type !== activeType) return false;
      if (activePeriod !== 'all' && item.period !== activePeriod) return false;
      if (activeScope !== 'all') {
        if (activeScope === 'main_only' && item.scope !== 'main_only') return false;
        if (activeScope === 'sub_only' && item.scope !== 'sub_only' && item.scope !== 'sub_with_badge')
          return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.code.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q)) ||
          (item.condition && item.condition.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [criteria, activeCategory, activeType, activePeriod, activeScope, searchQuery]);

  const handleOpenAddModal = () => {
    setEditingCriteria(null);
    setCode(`TC${(criteria.length + 1).toString().padStart(2, '0')}`);
    setName('');
    setCategory('Chất lượng học tập');
    setType('bonus');
    setPoints(2);
    setUnit('tiết');
    setPeriod('week');
    setScope('all');
    setTargetGrades('');
    setTargetClassType('all');
    setCondition('');
    setMaxCap('');
    setCalculationRule('standard');
    setDescription('');
    setIsActive(true);
    setShowModal(true);
  };

  const handleOpenEditModal = (crit: Criteria) => {
    setEditingCriteria(crit);
    setCode(crit.code);
    setName(crit.name);
    setCategory(crit.category);
    setType(crit.type);
    setPoints(crit.points);
    setUnit(crit.unit);
    setPeriod(crit.period || 'week');
    setScope(crit.scope || 'all');
    setTargetGrades(crit.targetGrades ? crit.targetGrades.join(',') : '');
    setTargetClassType(crit.targetClassType || 'all');
    setCondition(crit.condition || '');
    setMaxCap(crit.maxCap !== undefined ? String(crit.maxCap) : '');
    setCalculationRule(crit.calculationRule || 'standard');
    setDescription(crit.description || '');
    setIsActive(crit.isActive);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    const parsedGrades = targetGrades
      .split(',')
      .map((g) => parseInt(g.trim(), 10))
      .filter((g) => !isNaN(g));

    const parsedCap = maxCap.trim() ? parseFloat(maxCap) : undefined;

    const payload: Omit<Criteria, 'id'> = {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      category,
      type,
      points: Math.max(0, Number(points)),
      unit: unit.trim(),
      period,
      scope,
      targetGrades: parsedGrades.length > 0 ? parsedGrades : undefined,
      targetClassType: targetClassType !== 'all' ? targetClassType : undefined,
      condition: condition.trim() || undefined,
      maxCap: parsedCap,
      calculationRule,
      description: description.trim() || undefined,
      isActive,
    };

    if (editingCriteria) {
      updateCriteria(editingCriteria.id, payload);
    } else {
      addCriteria(payload);
    }

    setShowModal(false);
  };

  // Sandbox calculation result
  const sandboxResult = useMemo(() => {
    return previewCriteriaCalculation(sandboxCriteriaId, sandboxQuantity, sandboxClassId);
  }, [sandboxCriteriaId, sandboxQuantity, sandboxClassId, previewCriteriaCalculation]);

  // Preset quick tests for verification
  const runPresetTest = (clsName: string, critCode: string, qty: number) => {
    const cls = classes.find((c) => c.name === clsName);
    const crit = criteria.find((c) => c.code === critCode);
    if (cls && crit) {
      setSandboxClassId(cls.id);
      setSandboxCriteriaId(crit.id);
      setSandboxQuantity(qty);
    }
  };

  const canManage = currentUser.role === 'admin' || currentUser.role === 'inspector';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-1">
            <Sliders size={16} />
            <span>Quy chế thi đua động (Non-hardcoded)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Quản Lý Tiêu Chí Thi Đua & Tính Điểm Động
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Theo Quyết định số 2026-2027 THCS Lê Hữu Lập: Phân định rõ ràng Trường chính, Phân hiệu, Lớp A1 vs A2/A3, Bán trú, và Khối 9.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveViewTab('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeViewTab === 'list'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Danh sách ({criteria.length})
            </button>
            <button
              onClick={() => setActiveViewTab('sandbox')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeViewTab === 'sandbox'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap size={14} />
              <span>Kiểm thử tính điểm</span>
            </button>
          </div>

          {canManage && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Plus size={16} />
              <span>Thêm tiêu chí</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW TAB 1: CRITERIA LIST */}
      {activeViewTab === 'list' && (
        <>
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo mã (VD: CC01, TT03), tên tiêu chí, nội dung, điều kiện..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-indigo-500 focus:bg-white transition-all"
                />
              </div>

              {/* Scope & Period quick pills */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={activePeriod}
                  onChange={(e) => setActivePeriod(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                >
                  <option value="all">Mọi chu kỳ (Tuần/Tháng/Năm)</option>
                  <option value="week">Chu kỳ: Điểm Tuần</option>
                  <option value="month">Chu kỳ: Điểm Tháng</option>
                  <option value="year">Chu kỳ: Cả Năm</option>
                </select>

                <select
                  value={activeScope}
                  onChange={(e) => setActiveScope(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                >
                  <option value="all">Mọi phạm vi áp dụng</option>
                  <option value="main_only">Chỉ Trường chính</option>
                  <option value="sub_only">Chỉ Phân hiệu</option>
                </select>

                {/* Type Filter */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setActiveType('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Tất cả
                  </button>
                  <button
                    onClick={() => setActiveType('bonus')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeType === 'bonus' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    + Thưởng
                  </button>
                  <button
                    onClick={() => setActiveType('penalty')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeType === 'penalty' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-700 hover:bg-rose-50'
                    }`}
                  >
                    - Trừ
                  </button>
                </div>
              </div>
            </div>

            {/* Category horizontal scroll pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100 text-xs">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1 rounded-full whitespace-nowrap font-semibold cursor-pointer transition-all ${
                  activeCategory === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất cả nhóm ({criteria.length})
              </button>
              {categories.map((cat) => {
                const count = criteria.filter((c) => c.category === cat).length;
                if (count === 0) return null;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1 rounded-full whitespace-nowrap font-semibold cursor-pointer transition-all ${
                      activeCategory === cat
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Criteria Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCriteria.map((item) => {
              const isBonus = item.type === 'bonus';
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border p-4 transition-all flex flex-col justify-between relative shadow-xs ${
                    item.isActive
                      ? isBonus
                        ? 'border-emerald-200/70 hover:border-emerald-300'
                        : 'border-slate-200 hover:border-rose-200'
                      : 'opacity-60 bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-slate-900 text-white">
                          {item.code}
                        </span>

                        {/* Period Badge */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            item.period === 'week'
                              ? 'bg-cyan-100 text-cyan-800'
                              : item.period === 'month'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {item.period === 'week' ? 'Điểm Tuần' : item.period === 'month' ? 'Điểm Tháng' : 'Điểm Cả Năm'}
                        </span>

                        {/* Scope Badge */}
                        {item.scope === 'main_only' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                            Trường chính
                          </span>
                        )}
                        {item.scope === 'sub_only' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-teal-100 text-teal-800">
                            Phân hiệu
                          </span>
                        )}
                        {item.scope === 'sub_with_badge' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-teal-100 text-teal-800">
                            Phân hiệu có làm PH
                          </span>
                        )}

                        {/* Target class/grade badges */}
                        {item.targetClassType && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-800">
                            {item.targetClassType === 'A1' ? 'Lớp A1' : 'Lớp A2, A3'}
                          </span>
                        )}
                        {item.targetGrades && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            Khối {item.targetGrades.join(',')}
                          </span>
                        )}
                      </div>

                      {/* Points badge */}
                      <span
                        className={`text-sm font-black px-2.5 py-0.5 rounded-xl shrink-0 ${
                          isBonus ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isBonus ? `+${item.points}` : `-${item.points}`} đ
                      </span>
                    </div>

                    {/* Category */}
                    <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-1">
                      {item.category}
                    </div>

                    {/* Criteria Name */}
                    <h3 className="text-sm font-bold text-slate-900 leading-snug mb-2">
                      {item.name}
                    </h3>

                    {/* Condition / Max Cap box */}
                    {(item.condition || item.maxCap !== undefined) && (
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 mb-2.5 space-y-1">
                        {item.condition && (
                          <div className="text-[11px] text-indigo-900 flex items-start gap-1 font-medium">
                            <Info size={12} className="shrink-0 mt-0.5 text-indigo-600" />
                            <span>{item.condition}</span>
                          </div>
                        )}
                        {item.maxCap !== undefined && (
                          <div className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                            <AlertTriangle size={11} className="text-amber-600" />
                            <span>Giới hạn tối đa: {item.maxCap} điểm</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Description */}
                    {item.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Footer & Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="text-slate-600 font-medium">
                      Đơn vị: <span className="font-bold text-slate-800">{item.unit}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {canManage && (
                        <>
                          <button
                            onClick={() => toggleCriteriaActive(item.id)}
                            title={item.isActive ? 'Tạm tắt tiêu chí này' : 'Bật lại tiêu chí này'}
                            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                              item.isActive
                                ? 'text-emerald-600 hover:bg-emerald-50'
                                : 'text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            {item.isActive ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            title="Chỉnh sửa quy chuẩn tiêu chí"
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc muốn xóa tiêu chí "${item.code} - ${item.name}"?`)) {
                                deleteCriteria(item.id);
                              }
                            }}
                            title="Xóa tiêu chí"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCriteria.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
              <Search className="mx-auto text-slate-300 mb-3" size={36} />
              <h3 className="text-base font-bold text-slate-800">Không tìm thấy tiêu chí phù hợp</h3>
              <p className="text-xs text-slate-500 mt-1">
                Thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn các bộ lọc phạm vi / chu kỳ.
              </p>
            </div>
          )}
        </>
      )}

      {/* VIEW TAB 2: CRITERIA SANDBOX TESTER */}
      {activeViewTab === 'sandbox' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-md">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Zap size={16} />
              <span>Criteria Simulation Sandbox</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black">
              Bộ Kiểm Thử Tính Điểm Tự Động Theo Lớp & Phân Hiệu
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Chọn bất kỳ lớp học và tiêu chí nào để kiểm tra tính năng tự động nhận diện: Phân hiệu, Khối, Lớp A1 vs A2/A3,
              chu kỳ (Tuần/Tháng/Năm), công thức tính bậc thang, và áp dụng trần điểm theo đúng quyết định!
            </p>

            {/* Presets */}
            <div className="mt-4 pt-4 border-t border-indigo-800/60 flex flex-wrap gap-2 items-center text-xs">
              <span className="text-indigo-200 font-bold">Thử nhanh các ca đặc thù:</span>
              <button
                onClick={() => runPresetTest('6A1', 'TT03', 13)}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold transition-all cursor-pointer"
              >
                1. 6A1 Trường chính: 13 Điểm tốt (Đạt mốc +2đ)
              </button>
              <button
                onClick={() => runPresetTest('6A1', 'TT03', 10)}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold transition-all cursor-pointer"
              >
                2. 6A1 Trường chính: 10 Điểm tốt (Chưa đạt 13, 0đ)
              </button>
              <button
                onClick={() => runPresetTest('6A2', 'TT04', 10)}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold transition-all cursor-pointer"
              >
                3. 6A2 Trường chính: 10 Điểm tốt (Đạt mốc +2đ)
              </button>
              <button
                onClick={() => runPresetTest('6G1', 'TT02', 5)}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold transition-all cursor-pointer"
              >
                4. 6G1 Phân hiệu Hậu Lộc: 5 Điểm tốt (+2đ)
              </button>
              <button
                onClick={() => runPresetTest('8A2', 'HT04', 4)}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold transition-all cursor-pointer"
              >
                5. 8A2 Trường chính: 4 Điểm yếu (-2đ)
              </button>
              <button
                onClick={() => runPresetTest('7G2', 'HT03', 6)}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold transition-all cursor-pointer"
              >
                6. 7G2 Phân hiệu: 6 Điểm yếu (Trừ 2đ, trần 2đ)
              </button>
              <button
                onClick={() => runPresetTest('7A2', 'BT03', 2)}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold transition-all cursor-pointer"
              >
                7. 7A2 Bán trú trường chính: 2 HS vi phạm lần 3 (Trần 3đ)
              </button>
              <button
                onClick={() => runPresetTest('9A1', 'TG05', 1)}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold transition-all cursor-pointer"
              >
                8. 9A1 Khối 9 Đội tuyển tỉnh &gt;90% (+5đ cả năm)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form selectors */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <PlayCircle size={18} className="text-indigo-600" />
                <span>Chọn thông tin kiểm thử</span>
              </h4>

              {/* Class selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. Chọn Lớp kiểm thử
                </label>
                <select
                  value={sandboxClassId}
                  onChange={(e) => setSandboxClassId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-indigo-500"
                >
                  {campuses.map((camp) => (
                    <optgroup key={camp.id} label={`${camp.name} (${camp.type === 'main' ? 'Trường chính' : 'Phân hiệu'})`}>
                      {classes
                        .filter((c) => c.campusId === camp.id)
                        .map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            Lớp {cls.name} (Khối {cls.grade} - GVCN: {cls.homeroomTeacher})
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Criteria selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  2. Chọn Tiêu chí đánh giá
                </label>
                <select
                  value={sandboxCriteriaId}
                  onChange={(e) => setSandboxCriteriaId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-indigo-500"
                >
                  {criteria.map((crit) => (
                    <option key={crit.id} value={crit.id}>
                      [{crit.code}] {crit.name} ({crit.type === 'bonus' ? `+${crit.points}đ` : `-${crit.points}đ`} - {crit.unit})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  3. Nhập số lượng / Quy mô vi phạm / thành tích
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={sandboxQuantity}
                    onChange={(e) => setSandboxQuantity(Math.max(1, Number(e.target.value)))}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-indigo-500"
                  />
                  <span className="text-xs font-bold text-slate-500 px-3 py-2 bg-slate-100 rounded-xl">
                    {sandboxResult.criteria?.unit || 'lần'}
                  </span>
                </div>
              </div>

              {/* Information about selected class */}
              {sandboxResult.targetClass && sandboxResult.campus && (
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phân hiệu:</span>
                    <span className="font-bold text-slate-800">
                      {sandboxResult.campus.name} ({sandboxResult.campus.type === 'main' ? 'Trường chính' : 'Phân hiệu'})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Lớp & Khối:</span>
                    <span className="font-bold text-slate-800">
                      Lớp {sandboxResult.targetClass.name} - Khối {sandboxResult.targetClass.grade}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phân loại lớp:</span>
                    <span className="font-bold text-indigo-700">
                      {sandboxResult.targetClass.name.endsWith('A1')
                        ? 'Lớp chọn A1 trường chính'
                        : sandboxResult.targetClass.name.endsWith('A2') || sandboxResult.targetClass.name.endsWith('A3')
                        ? 'Lớp A2, A3 trường chính'
                        : 'Lớp chuẩn phân hiệu'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Simulation output */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Sparkles size={18} className="text-amber-500" />
                    <span>Kết quả phân tích & tính điểm tự động</span>
                  </h4>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      sandboxResult.applicable
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {sandboxResult.applicable ? 'Hợp lệ áp dụng' : 'Không áp dụng'}
                  </span>
                </div>

                {!sandboxResult.applicable && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle size={18} className="shrink-0 text-rose-600" />
                    <span>{sandboxResult.reason}</span>
                  </div>
                )}

                {/* Score Big Display */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-center">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Điểm thi đua được tính
                  </div>
                  <div
                    className={`text-4xl sm:text-5xl font-black ${
                      sandboxResult.totalPoints > 0
                        ? 'text-emerald-600'
                        : sandboxResult.totalPoints < 0
                        ? 'text-rose-600'
                        : 'text-slate-500'
                    }`}
                  >
                    {sandboxResult.totalPoints > 0
                      ? `+${sandboxResult.totalPoints}`
                      : sandboxResult.totalPoints}
                    <span className="text-base font-bold ml-1 text-slate-500">điểm</span>
                  </div>

                  <div className="text-xs font-semibold text-slate-700 mt-2">
                    {sandboxResult.calculationDetail}
                  </div>
                </div>

                {/* Breakdown details */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-500 block mb-0.5">Chu kỳ tính điểm:</span>
                    <span className="font-bold text-indigo-700">
                      {sandboxResult.period === 'week'
                        ? 'Điểm Tuần'
                        : sandboxResult.period === 'month'
                        ? 'Điểm Tháng'
                        : 'Điểm Cả Năm'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-500 block mb-0.5">Giới hạn tối đa (Cap):</span>
                    <span className="font-bold text-slate-800">
                      {sandboxResult.appliedCap !== undefined
                        ? `${sandboxResult.appliedCap} điểm`
                        : 'Không giới hạn'}
                    </span>
                  </div>
                </div>

                {sandboxResult.isDisciplinary && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle size={16} className="shrink-0 text-rose-600" />
                    <span>
                      Hành vi này bị Hội đồng kỷ luật xử lý: Lớp sẽ <strong>không được xếp loại thi đua cả năm</strong> (theo Mục II của Quyết định).
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                <span>Hệ thống chấm điểm tự động đã sẵn sàng.</span>
                <span className="text-indigo-600 font-bold">100% Non-hardcoded</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Criteria */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-black text-slate-900">
                {editingCriteria ? 'Chỉnh Sửa Tiêu Chí Thi Đua' : 'Thêm Tiêu Chí Thi Đua Mới'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Code */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mã tiêu chí <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="VD: CC01, TT03, HV05"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-bold focus:outline-indigo-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nhóm tiêu chí <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-indigo-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nội dung vi phạm / thành tích <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ghi rõ hành vi vi phạm hoặc thành tích đạt được..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-indigo-500"
                />
              </div>

              {/* Type, Points, Unit, Period */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Loại điểm</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-indigo-500"
                  >
                    <option value="bonus">+ Điểm Cộng</option>
                    <option value="penalty">- Điểm Trừ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mức điểm</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Đơn vị tính</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="lần, tiết, HS, buổi"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Chu kỳ tính</label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-indigo-500"
                  >
                    <option value="week">Điểm Tuần</option>
                    <option value="month">Điểm Tháng</option>
                    <option value="year">Điểm Cả Năm</option>
                  </select>
                </div>
              </div>

              {/* Scope, Target Grades, Target Class Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phạm vi áp dụng</label>
                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-indigo-500"
                  >
                    <option value="all">Toàn trường (Tất cả)</option>
                    <option value="main_only">Chỉ Trường chính</option>
                    <option value="sub_only">Chỉ các Phân hiệu</option>
                    <option value="sub_with_badge">Phân hiệu có làm phù hiệu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lớp đặc thù</label>
                  <select
                    value={targetClassType}
                    onChange={(e) => setTargetClassType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-indigo-500"
                  >
                    <option value="all">Tất cả các lớp</option>
                    <option value="A1">Chỉ lớp A1 trường chính</option>
                    <option value="A2_A3">Chỉ lớp A2, A3 trường chính</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Khối áp dụng</label>
                  <input
                    type="text"
                    value={targetGrades}
                    onChange={(e) => setTargetGrades(e.target.value)}
                    placeholder="Để trống = Tất cả, hoặc 6,7,8"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-indigo-500"
                  />
                </div>
              </div>

              {/* Calculation Rule, Max Cap, Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quy tắc tính toán đặc thù</label>
                  <select
                    value={calculationRule}
                    onChange={(e) => setCalculationRule(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-indigo-500"
                  >
                    <option value="standard">Tiêu chuẩn (Điểm x Số lượng)</option>
                    <option value="weak_score_main">Điểm yếu Trường chính (2 con -1đ, tiếp +0.5đ)</option>
                    <option value="weak_score_sub">Điểm yếu Phân hiệu (≥5 con -2đ)</option>
                    <option value="good_score_main_a1">Điểm tốt Trường chính Lớp A1 (≥13 con +2đ)</option>
                    <option value="good_score_main_a2a3">Điểm tốt Trường chính Lớp A2, A3 (≥10 con +2đ)</option>
                    <option value="good_score_sub">Điểm tốt Phân hiệu (≥5 con +2đ)</option>
                    <option value="dormitory_step">Bán trú trường chính (Lần 3 đình chỉ, max 3đ)</option>
                    <option value="ceremony_team">Đội nghi lễ phục vụ LĐ (0.1đ/em, max 0.5đ)</option>
                    <option value="provincial_exam_k9">Đội tuyển tỉnh Khối 9 (80-85%: +2đ, 86-89%: +3đ, &gt;90%: +5đ)</option>
                    <option value="club_exchange_k678">Giao lưu CLB văn hóa K6-8</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Giới hạn điểm tối đa (Cap)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={maxCap}
                    onChange={(e) => setMaxCap(e.target.value)}
                    placeholder="Để trống nếu không giới hạn (VD: 2, 3, 0.5)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-indigo-500"
                  />
                </div>
              </div>

              {/* Condition description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Điều kiện áp dụng đặc biệt</label>
                <input
                  type="text"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  placeholder="VD: Trường chính từ 2 em trở lên có giải; Phân hiệu 1 em có giải..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-indigo-500"
                />
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded-sm"
                />
                <label htmlFor="isActive" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Kích hoạt tiêu chí này trong hệ thống chấm điểm
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer"
                >
                  {editingCriteria ? 'Lưu thay đổi' : 'Thêm tiêu chí'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
