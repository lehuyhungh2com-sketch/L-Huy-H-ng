import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Trophy,
  Award,
  TrendingUp,
  School,
  BookOpen,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Plus,
  Flag,
  Search,
  Filter,
  Lock,
  Unlock,
  FileText,
  BarChart3,
  Sliders,
  Users2,
  ChevronLeft,
  Eye
} from 'lucide-react';
import { ClassDetailModal } from '../common/ClassDetailModal';
import { ClassItem, RankingEntry } from '../../types';

export const DashboardOverview: React.FC = () => {
  const {
    campuses,
    classes,
    scoreLogs,
    settings,
    selectedWeek,
    setSelectedWeek,
    setCurrentTab,
    setSelectedCampusId,
    getWeeklyRankings,
    getSchoolStats,
    isWeekLocked,
    toggleLockWeek,
    currentUser,
  } = useApp();

  const [inspectClass, setInspectClass] = useState<ClassItem | null>(null);

  // Filters for Fast Ranking Table
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<number | 'all'>('all');
  const [quickCampusFilter, setQuickCampusFilter] = useState<string>('all');

  const isLocked = isWeekLocked(selectedWeek);
  const canLock = currentUser.role === 'admin' || currentUser.role === 'inspector';

  // Weekly Stats and Rankings
  const rankings = getWeeklyRankings(selectedWeek, quickCampusFilter, selectedGrade);
  const allRankings = getWeeklyRankings(selectedWeek, 'all', 'all');
  const stats = getSchoolStats(selectedWeek);

  const topThree = allRankings.slice(0, 3);
  const recentLogs = scoreLogs.filter((l) => l.week === selectedWeek).slice(0, 6);

  // Filter rankings by search query
  const filteredRankings = useMemo(() => {
    if (!searchQuery.trim()) return rankings;
    const q = searchQuery.toLowerCase().trim();
    return rankings.filter(
      (r) =>
        r.classItem.name.toLowerCase().includes(q) ||
        r.classItem.homeroomTeacher.toLowerCase().includes(q) ||
        r.campus.name.toLowerCase().includes(q)
    );
  }, [rankings, searchQuery]);

  const handleCampusCardClick = (campusId: string) => {
    if (quickCampusFilter === campusId) {
      setQuickCampusFilter('all');
    } else {
      setQuickCampusFilter(campusId);
    }
  };

  const handlePrevWeek = () => {
    if (selectedWeek > 1) setSelectedWeek(selectedWeek - 1);
  };

  const handleNextWeek = () => {
    if (selectedWeek < 35) setSelectedWeek(selectedWeek + 1);
  };

  // Quick Action Menu Items (Ít thao tác, dễ dùng với giáo viên)
  const quickActions = [
    {
      title: 'Nhập điểm tuần',
      desc: 'Chấm điểm nề nếp & vi phạm',
      icon: Plus,
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
      iconBg: 'bg-white/20 text-white',
      tab: 'scoring' as const,
    },
    {
      title: 'Đội Cờ Đỏ',
      desc: 'Lịch trực & chấm nhanh',
      icon: Flag,
      color: 'bg-rose-600 hover:bg-rose-700 text-white',
      iconBg: 'bg-white/20 text-white',
      tab: 'redflag' as const,
    },
    {
      title: 'Xếp hạng thi đua',
      desc: 'Xem thứ hạng tuần & tháng',
      icon: Trophy,
      color: 'bg-amber-600 hover:bg-amber-700 text-white',
      iconBg: 'bg-white/20 text-white',
      tab: 'rankings' as const,
    },
    {
      title: 'Chốt dữ liệu tuần',
      desc: isLocked ? 'Tuần đã khóa sổ' : 'Khóa sổ số liệu tuần',
      icon: Lock,
      color: 'bg-[#0c2340] hover:bg-[#123157] text-white',
      iconBg: 'bg-white/20 text-white',
      tab: 'datalock' as const,
    },
    {
      title: 'Báo cáo & In ấn',
      desc: 'Xuất biểu mẫu & chào cờ',
      icon: BarChart3,
      color: 'bg-emerald-700 hover:bg-emerald-800 text-white',
      iconBg: 'bg-white/20 text-white',
      tab: 'reports' as const,
    },
    {
      title: 'Bộ tiêu chí',
      desc: 'Quy chế điểm cộng & trừ',
      icon: Sliders,
      color: 'bg-slate-700 hover:bg-slate-800 text-white',
      iconBg: 'bg-white/20 text-white',
      tab: 'criteria' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner: Tên trường, Năm học, Bộ chọn tuần */}
      <div className="bg-gradient-to-r from-[#0c2340] via-blue-900 to-blue-800 rounded-2xl p-5 sm:p-7 text-white shadow-md relative overflow-hidden border border-blue-700/50">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-wider">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-400/30">
                <School size={14} />
                <span>TRƯỜNG THCS LÊ HỮU LẬP</span>
              </span>
              <span className="px-2.5 py-1 rounded-md bg-blue-500/30 border border-blue-400/30 text-blue-100">
                NĂM HỌC {settings.academicYear}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/10 text-white">
                6 PHÂN HIỆU · {classes.length} LỚP HỌC
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">
              Cổng Thông Tin & Xếp Loại Thi Đua Nề Nếp Học Đường
            </h1>

            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
              Hệ thống quản lý, giám sát và xếp thứ tự thi đua tự động giữa 6 phân hiệu và {classes.length} lớp học trường THCS Lê Hữu Lập theo thang điểm chuẩn 100 điểm/tuần.
            </p>
          </div>

          {/* Week Controller & Lock Status */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
            <div className="flex items-center gap-1 bg-[#0c2340]/80 rounded-xl p-1 border border-white/15">
              <button
                onClick={handlePrevWeek}
                disabled={selectedWeek <= 1}
                className="p-1.5 rounded-lg text-blue-200 hover:bg-white/10 hover:text-white disabled:opacity-30 cursor-pointer"
                title="Tuần trước"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="px-2 text-center">
                <div className="text-[10px] uppercase font-bold text-emerald-300">Đang chọn tuần</div>
                <select
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(Number(e.target.value))}
                  className="bg-transparent text-white font-extrabold text-sm focus:outline-hidden cursor-pointer"
                >
                  {Array.from({ length: 35 }, (_, i) => i + 1).map((w) => (
                    <option key={w} value={w} className="bg-[#0c2340] text-white">
                      Tuần {w} ({w <= 18 ? 'HK1' : 'HK2'})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleNextWeek}
                disabled={selectedWeek >= 35}
                className="p-1.5 rounded-lg text-blue-200 hover:bg-white/10 hover:text-white disabled:opacity-30 cursor-pointer"
                title="Tuần kế tiếp"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Lock Status Pill with direct toggle if admin */}
            <div className="flex items-center gap-2">
              {isLocked ? (
                <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-bold flex items-center gap-1.5">
                  <Lock size={14} className="text-amber-300" />
                  <span>Tuần {selectedWeek} đã chốt sổ</span>
                </div>
              ) : (
                <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold flex items-center gap-1.5">
                  <Unlock size={14} className="text-emerald-300" />
                  <span>Tuần {selectedWeek} đang mở</span>
                </div>
              )}

              {canLock && (
                <button
                  onClick={() => toggleLockWeek(selectedWeek)}
                  className={`p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                    isLocked
                      ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-400'
                      : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400'
                  }`}
                  title={isLocked ? 'Mở khóa tuần này' : 'Chốt sổ tuần này'}
                >
                  {isLocked ? <Unlock size={14} /> : <Lock size={14} />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Menu Chức Năng (1-chạm dành cho giáo viên và ban thi đua) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-extrabold uppercase text-blue-950 tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>Nghiệp Vụ Nhanh (Thao Tác 1 Chạm)</span>
          </h2>
          <span className="text-xs text-slate-500">Truy cập tức thì các tính năng chính</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={() => setCurrentTab(action.tab)}
                className={`p-3.5 rounded-xl ${action.color} text-left transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md cursor-pointer flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${action.iconBg}`}>
                    <Icon size={18} />
                  </div>
                  <ChevronRight size={14} className="opacity-70" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold leading-tight truncate">
                    {action.title}
                  </div>
                  <div className="text-[11px] opacity-80 mt-0.5 truncate">
                    {action.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Dashboard Điểm Thi Đua (KPIs chỉ số tuần) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Điểm TB */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Điểm TB Toàn Trường</span>
            <TrendingUp size={16} className="text-blue-600" />
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-black text-blue-950 tabular-nums">
              {stats.avgScore}{' '}
              <span className="text-xs font-normal text-slate-400">/ 100.0 đ</span>
            </div>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1 w-fit border border-emerald-200">
            <CheckCircle2 size={12} className="text-emerald-600" />
            <span>Điểm gốc tuần: 100 điểm</span>
          </div>
        </div>

        {/* KPI 2: Lớp dẫn đầu */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Dẫn Đầu Toàn Trường</span>
            <Trophy size={16} className="text-amber-500" />
          </div>
          <div className="my-2">
            <div className="text-xl sm:text-2xl font-black text-blue-950 truncate">
              {stats.topClass ? `Lớp ${stats.topClass.classItem.name}` : '---'}
            </div>
            <div className="text-[11px] text-slate-500 truncate mt-0.5">
              {stats.topClass ? `${stats.topClass.campus.name} • GVCN: ${stats.topClass.classItem.homeroomTeacher}` : 'Chưa có dữ liệu'}
            </div>
          </div>
          <div className="text-[11px] font-extrabold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md w-fit border border-blue-200 tabular-nums">
            {stats.topClass ? `${stats.topClass.totalScore} điểm (${stats.topClass.performanceTier})` : '0 đ'}
          </div>
        </div>

        {/* KPI 3: Thưởng / Trừ */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Điểm Cộng / Điểm Trừ</span>
            <Sparkles size={16} className="text-emerald-600" />
          </div>
          <div className="my-2 flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-black text-emerald-700 tabular-nums">
              +{stats.totalBonusPoints}
            </span>
            <span className="text-slate-300 font-bold">/</span>
            <span className="text-xl sm:text-2xl font-black text-rose-700 tabular-nums">
              -{stats.totalPenaltyPoints}
            </span>
          </div>
          <div className="text-[11px] text-slate-600">
            <strong>{stats.totalHonors}</strong> khen thưởng · <strong>{stats.totalViolations}</strong> vi phạm
          </div>
        </div>

        {/* KPI 4: Xếp loại Tốt & Xuất sắc */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Tỷ Lệ Đạt Tốt & Xuất Sắc</span>
            <Award size={16} className="text-blue-600" />
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-black text-blue-950 tabular-nums">
              {allRankings.length > 0
                ? `${Math.round((allRankings.filter((r) => r.totalScore >= 90).length / allRankings.length) * 100)}%`
                : '100%'}
            </div>
          </div>
          <div className="text-[11px] text-slate-600">
            {allRankings.filter((r) => r.totalScore >= 90).length} / {allRankings.length} lớp đạt $\ge$ 90 điểm
          </div>
        </div>
      </div>

      {/* 4. 6 Phân Hiệu Trường THCS Lê Hữu Lập (Thẻ trực quan & Lọc 1-click) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-extrabold text-blue-950 flex items-center gap-2">
              <School size={18} className="text-blue-700" />
              <span>Thi Đua 6 Phân Hiệu Trường THCS Lê Hữu Lập</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Nhấp vào một phân hiệu để lọc nhanh bảng xếp hạng các lớp bên dưới
            </p>
          </div>

          <div className="flex items-center gap-2">
            {quickCampusFilter !== 'all' && (
              <button
                onClick={() => setQuickCampusFilter('all')}
                className="text-xs text-blue-700 font-bold bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 hover:bg-blue-100 cursor-pointer"
              >
                ✕ Hủy lọc phân hiệu
              </button>
            )}
            <button
              onClick={() => setCurrentTab('campuses')}
              className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Xem chi tiết 6 phân hiệu</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {campuses.map((camp) => {
            const campClasses = classes.filter((c) => c.campusId === camp.id);
            const campRankings = allRankings.filter((r) => r.campus.id === camp.id);
            const avgScore =
              campRankings.length > 0
                ? Number((campRankings.reduce((sum, r) => sum + r.totalScore, 0) / campRankings.length).toFixed(1))
                : 100;
            const topInCamp = campRankings[0];
            const isSelected = quickCampusFilter === camp.id;

            return (
              <div
                key={camp.id}
                onClick={() => handleCampusCardClick(camp.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/60 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-blue-300 hover:shadow-xs bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                        camp.type === 'main'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {camp.type === 'main' ? 'Trường chính' : 'Phân hiệu'}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {campClasses.length} lớp
                    </span>
                  </div>

                  <h3 className="font-extrabold text-blue-950 text-base leading-snug">
                    {camp.name}
                  </h3>
                  <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                    Phụ trách: <strong>{camp.leaderName}</strong>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Điểm TB tuần</span>
                    <div className="text-base font-extrabold text-blue-950 tabular-nums">
                      {avgScore} đ
                    </div>
                  </div>

                  {topInCamp && (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Dẫn đầu</span>
                      <div className="text-xs font-bold text-blue-800">
                        Lớp {topInCamp.classItem.name} ({topInCamp.totalScore}đ)
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Xếp Hạng Nhanh & Lọc Khối (Data Table High-Density, Chuẩn sư phạm) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Header & Controls Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/75 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-blue-950 flex items-center gap-2">
              <Trophy size={18} className="text-amber-500" />
              <span>Bảng Xếp Hạng Nhanh Tuần {selectedWeek}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Thang điểm 100 • {quickCampusFilter === 'all' ? 'Tất cả 6 phân hiệu' : campuses.find(c => c.id === quickCampusFilter)?.name}
            </p>
          </div>

          {/* Search & Grade Filter Buttons (Ít thao tác, rõ ràng) */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm lớp, GVCN..."
                className="pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 w-44 sm:w-52"
              />
            </div>

            {/* Filter by Grade */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 text-xs font-semibold">
              <button
                onClick={() => setSelectedGrade('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedGrade === 'all' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tất cả
              </button>
              {[6, 7, 8, 9].map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGrade(g as 6 | 7 | 8 | 9)}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    selectedGrade === g ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Khối {g}
                </button>
              ))}
            </div>

            {/* View Full Ranking Button */}
            <button
              onClick={() => setCurrentTab('rankings')}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Chi tiết</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4 text-center w-16">Thứ hạng</th>
                <th className="py-3 px-4">Lớp học</th>
                <th className="py-3 px-3">Phân hiệu</th>
                <th className="py-3 px-4">Giáo viên chủ nhiệm</th>
                <th className="py-3 px-3 text-right">Điểm gốc</th>
                <th className="py-3 px-3 text-right text-emerald-700">Điểm thưởng</th>
                <th className="py-3 px-3 text-right text-rose-700">Điểm trừ</th>
                <th className="py-3 px-4 text-right font-black text-blue-950">Tổng điểm</th>
                <th className="py-3 px-3 text-center">Xếp loại</th>
                <th className="py-3 px-3 text-center">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRankings.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-slate-400">
                    Không tìm thấy lớp học phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredRankings.map((r, idx) => {
                  const isTop1 = r.rank === 1;
                  const isTop2 = r.rank === 2;
                  const isTop3 = r.rank === 3;

                  return (
                    <tr
                      key={r.classItem.id}
                      onClick={() => setInspectClass(r.classItem)}
                      className={`hover:bg-blue-50/50 transition-colors cursor-pointer ${
                        isTop1 ? 'bg-amber-50/40' : idx % 2 === 1 ? 'bg-slate-50/30' : ''
                      }`}
                    >
                      {/* Rank Column */}
                      <td className="py-3 px-4 text-center font-bold">
                        {isTop1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white text-xs shadow-xs font-black">
                            1
                          </span>
                        ) : isTop2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-400 text-white text-xs shadow-xs font-black">
                            2
                          </span>
                        ) : isTop3 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700 text-white text-xs shadow-xs font-black">
                            3
                          </span>
                        ) : (
                          <span className="text-slate-500 font-mono">{r.rank}</span>
                        )}
                      </td>

                      {/* Class Name */}
                      <td className="py-3 px-4 font-black text-blue-950 text-sm">
                        Lớp {r.classItem.name}
                        <span className="text-[11px] font-normal text-slate-400 ml-1.5">
                          (Khối {r.classItem.grade})
                        </span>
                      </td>

                      {/* Campus */}
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {r.campus.name}
                      </td>

                      {/* Homeroom Teacher */}
                      <td className="py-3 px-4 text-slate-700">
                        {r.classItem.homeroomTeacher}
                      </td>

                      {/* Base Score */}
                      <td className="py-3 px-3 text-right font-mono text-slate-400 tabular-nums">
                        100.0
                      </td>

                      {/* Bonus Points */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 tabular-nums">
                        {r.bonusPoints > 0 ? `+${r.bonusPoints}` : '0'}
                      </td>

                      {/* Penalty Points */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-rose-700 tabular-nums">
                        {r.penaltyPoints > 0 ? `-${r.penaltyPoints}` : '0'}
                      </td>

                      {/* Total Score */}
                      <td className="py-3 px-4 text-right font-mono font-black text-blue-950 text-sm tabular-nums">
                        {r.totalScore} đ
                      </td>

                      {/* Tier Badge */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            r.performanceTier === 'Xuất sắc'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : r.performanceTier === 'Tốt'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : r.performanceTier === 'Khá'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {r.performanceTier}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectClass(r.classItem);
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                          title="Xem sổ ghi chi tiết"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <div>
            Hiển thị <strong>{filteredRankings.length}</strong> lớp học trên tổng số {classes.length} lớp toàn trường.
          </div>
          <div className="flex items-center gap-1 font-semibold text-blue-700">
            <span>Bấm vào từng lớp để xem biên bản điểm cộng/trừ chi tiết</span>
          </div>
        </div>
      </div>

      {/* Class Details Modal */}
      {inspectClass && (
        <ClassDetailModal
          classItem={inspectClass}
          week={selectedWeek}
          onClose={() => setInspectClass(null)}
        />
      )}
    </div>
  );
};
