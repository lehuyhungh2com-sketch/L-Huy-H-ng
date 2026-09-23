import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Award, 
  Menu, 
  X, 
  ShieldCheck, 
  UserCheck, 
  School, 
  GraduationCap, 
  Users, 
  ChevronDown,
  Calendar,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  Eye,
  Flag,
  Scale,
  FileSpreadsheet,
} from 'lucide-react';
import { RoleType } from '../../types';
import { ROLE_METADATA } from '../../utils/rbac';
import { RegulationAuditModal } from '../compliance/RegulationAuditModal';
import { BackupExcelCenterModal } from '../backup/BackupExcelCenterModal';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  isMobileSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar, isMobileSidebarOpen }) => {
  const { 
    currentUser, 
    userRole,
    users, 
    switchCurrentUser, 
    settings, 
    selectedWeek, 
    setSelectedWeek,
    isWeekLocked 
  } = useApp();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);

  const isLocked = isWeekLocked(selectedWeek);
  const currentRoleMeta = ROLE_METADATA[userRole];

  const getRoleIcon = (role: RoleType) => {
    switch (role) {
      case 'super_admin':
      case 'admin':
        return ShieldCheck;
      case 'bgh':
        return Award;
      case 'campus_admin':
      case 'campus_lead':
        return School;
      case 'tpt_doi':
      case 'inspector':
        return UserCheck;
      case 'gvcn':
      case 'teacher':
        return GraduationCap;
      case 'red_flag':
        return Flag;
      case 'viewer':
      case 'public':
      default:
        return Eye;
    }
  };

  const RoleIcon = getRoleIcon(userRole);

  const handlePrevWeek = () => {
    if (selectedWeek > 1) setSelectedWeek(selectedWeek - 1);
  };

  const handleNextWeek = () => {
    if (selectedWeek < 35) setSelectedWeek(selectedWeek + 1);
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Mobile Toggle & Brand Lockup */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-hidden"
            aria-label="Mở danh mục"
          >
            {isMobileSidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div className="flex items-center gap-3 min-w-0">
            {/* School Emblem / Logo */}
            <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center text-white shadow-sm shrink-0 border border-blue-600">
              <Award size={22} className="text-amber-300" />
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-blue-950 text-base sm:text-lg leading-tight tracking-tight truncate">
                  TRƯỜNG THCS LÊ HỮU LẬP
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md shrink-0">
                  NĂM HỌC {settings.academicYear}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block truncate">
                Phần mềm quản lý & xếp loại thi đua nề nếp 6 phân hiệu
              </p>
            </div>
          </div>
        </div>

        {/* Center / Right: Week Control & Role Profile */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Quick Week Navigator (Ít thao tác, trực quan cho giáo viên) */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 gap-1">
            <button
              onClick={handlePrevWeek}
              disabled={selectedWeek <= 1}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-blue-700 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="Tuần trước"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1.5 px-2">
              <Calendar size={14} className="text-blue-600 shrink-0" />
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(Number(e.target.value))}
                className="bg-transparent text-xs sm:text-sm font-bold text-blue-950 focus:outline-hidden cursor-pointer"
              >
                {Array.from({ length: 35 }, (_, i) => i + 1).map((w) => (
                  <option key={w} value={w}>
                    Tuần {w} {w <= 18 ? '(HK1)' : '(HK2)'}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleNextWeek}
              disabled={selectedWeek >= 35}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-blue-700 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="Tuần kế tiếp"
            >
              <ChevronRight size={16} />
            </button>

            {/* Lock Status Pill */}
            <div className="hidden md:flex items-center pl-2 pr-1 border-l border-slate-200">
              {isLocked ? (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                  <Lock size={12} className="text-amber-600" />
                  <span>Đã chốt sổ</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  <Unlock size={12} className="text-emerald-600" />
                  <span>Đang mở ghi</span>
                </span>
              )}
            </div>
          </div>

          {/* Quick Compliance Audit & Standby Excel Buttons */}
          <div className="hidden lg:flex items-center gap-1.5">
            <button
              onClick={() => setShowAuditModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white hover:bg-indigo-50/60 text-slate-700 hover:text-indigo-800 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="Rà soát đối chiếu toàn vẹn quy định công văn của Nhà trường"
            >
              <Scale size={15} className="text-indigo-600" />
              <span>Rà Soát Quy Chuẩn</span>
            </button>

            <button
              onClick={() => setShowBackupModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-emerald-200 hover:border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-900 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="Xuất bảng tính Excel dự phòng & sao lưu toàn bộ hệ thống"
            >
              <FileSpreadsheet size={15} className="text-emerald-700" />
              <span>Sao Lưu & Excel</span>
            </button>
          </div>

          {/* Role Switcher Menu */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 hover:border-blue-300 bg-white hover:bg-blue-50/50 text-left transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
                <RoleIcon size={16} />
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-bold text-slate-900 leading-none truncate max-w-[140px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-blue-700 font-semibold mt-0.5 leading-none">
                  {currentRoleMeta ? currentRoleMeta.name : currentUser.role}
                </div>
              </div>
              <ChevronDown size={14} className="text-slate-400 shrink-0" />
            </button>

            {/* Role Dropdown */}
            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-slate-100 bg-blue-50/40">
                  <p className="text-xs font-bold text-blue-950">Chuyển đổi tài khoản trải nghiệm RBAC</p>
                  <p className="text-[11px] text-slate-500">Mô phỏng chính xác 7 vai trò người dùng trong hệ thống</p>
                </div>

                <div className="max-h-72 overflow-y-auto py-1">
                  {users.map((u) => {
                    const isSelected = u.id === currentUser.id;
                    const uMeta = ROLE_METADATA[u.role] || { name: u.role, badgeColor: 'bg-slate-100 text-slate-700' };
                    const UIcon = getRoleIcon(u.role);
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchCurrentUser(u.id);
                          setShowRoleDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-start gap-2.5 transition-colors cursor-pointer ${
                          isSelected ? 'bg-blue-50 text-blue-900 font-medium' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="mt-0.5 p-1 rounded-md bg-slate-100 text-slate-600 shrink-0">
                          <UIcon size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-900 truncate">
                              {u.name}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${uMeta.badgeColor}`}>
                              {uMeta.name}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{u.title}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compliance Audit Modal */}
      <RegulationAuditModal isOpen={showAuditModal} onClose={() => setShowAuditModal(false)} />

      {/* Backup & Standby Excel Center Modal */}
      <BackupExcelCenterModal isOpen={showBackupModal} onClose={() => setShowBackupModal(false)} />
    </header>
  );
};
