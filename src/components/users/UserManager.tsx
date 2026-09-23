import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RoleType, User } from '../../types';
import { ROLE_METADATA, canManageUsers } from '../../utils/rbac';
import {
  Users2,
  Plus,
  ShieldCheck,
  UserCheck,
  School,
  GraduationCap,
  Users,
  Check,
  X,
  Edit2,
  Trash2,
  ArrowRight,
  Eye,
  Flag,
  Award,
  AlertCircle,
  Search,
  Filter,
} from 'lucide-react';

export const UserManager: React.FC = () => {
  const {
    users,
    currentUser,
    userRole,
    switchCurrentUser,
    addUser,
    updateUser,
    deleteUser,
    campuses,
    classes,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Modal State for Add / Edit
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<RoleType>('gvcn');
  const [formEmail, setFormEmail] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formCampusId, setFormCampusId] = useState<string>('');
  const [formClassId, setFormClassId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');

  const isSuperAdmin = canManageUsers(currentUser);

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

  const handleOpenCreate = () => {
    setModalMode('create');
    setEditingUserId(null);
    setFormName('');
    setFormRole('gvcn');
    setFormEmail('');
    setFormTitle('Giáo viên Chủ nhiệm');
    setFormCampusId(campuses[0]?.id || '');
    setFormClassId(classes[0]?.id || '');
    setErrorMessage('');
  };

  const handleOpenEdit = (user: User) => {
    setModalMode('edit');
    setEditingUserId(user.id);
    setFormName(user.name);
    setFormRole(user.role);
    setFormEmail(user.email);
    setFormTitle(user.title);
    setFormCampusId(user.campusId || '');
    setFormClassId(user.classId || '');
    setErrorMessage('');
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setErrorMessage('Vui lòng nhập họ và tên người dùng');
      return;
    }

    if (modalMode === 'create') {
      const res = addUser({
        name: formName.trim(),
        role: formRole,
        email: formEmail.trim() || `${formRole}_${Date.now()}@lehuulap.edu.vn`,
        title: formTitle.trim() || ROLE_METADATA[formRole]?.name || 'Thành viên',
        campusId: formCampusId || undefined,
        classId: formRole === 'gvcn' || formRole === 'teacher' ? formClassId : undefined,
      });

      if (!res.success) {
        setErrorMessage(res.message || 'Không thể tạo tài khoản');
        return;
      }
    } else if (modalMode === 'edit' && editingUserId) {
      const res = updateUser(editingUserId, {
        name: formName.trim(),
        role: formRole,
        email: formEmail.trim(),
        title: formTitle.trim(),
        campusId: formCampusId || undefined,
        classId: formRole === 'gvcn' || formRole === 'teacher' ? formClassId : undefined,
      });

      if (!res.success) {
        setErrorMessage(res.message || 'Không thể cập nhật tài khoản');
        return;
      }
    }

    setModalMode(null);
  };

  const handleDelete = (user: User) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa tài khoản ${user.name} (${user.title})?`)) {
      return;
    }
    const res = deleteUser(user.id);
    if (!res.success) {
      alert(res.message);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchTitle = u.title.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      if (!matchName && !matchTitle && !matchEmail) return false;
    }
    return true;
  });

  // Comprehensive 7-Role Permissions Matrix Table
  const permissionsMatrix = [
    {
      feature: 'Toàn quyền cấu hình hệ thống & Quản lý User',
      super_admin: true,
      bgh: false,
      campus_admin: false,
      tpt_doi: false,
      gvcn: false,
      red_flag: false,
      viewer: false,
    },
    {
      feature: 'Duyệt & Khóa chốt dữ liệu thi đua tuần toàn trường',
      super_admin: true,
      bgh: true,
      campus_admin: false,
      tpt_doi: false,
      gvcn: false,
      red_flag: false,
      viewer: false,
    },
    {
      feature: 'Xem toàn trường (6 phân hiệu, 59 lớp)',
      super_admin: true,
      bgh: true,
      campus_admin: false,
      tpt_doi: false,
      gvcn: false,
      red_flag: false,
      viewer: true,
    },
    {
      feature: 'Quản lý phân hiệu được phân công (Điểm & Lớp)',
      super_admin: true,
      bgh: true,
      campus_admin: true,
      tpt_doi: false,
      gvcn: false,
      red_flag: false,
      viewer: false,
    },
    {
      feature: 'Nhập & quản lý dữ liệu thi đua phân hiệu được giao',
      super_admin: true,
      bgh: false,
      campus_admin: true,
      tpt_doi: true,
      gvcn: false,
      red_flag: false,
      viewer: false,
    },
    {
      feature: 'Nhập điểm trực tuần theo phân công nhiệm vụ',
      super_admin: true,
      bgh: false,
      campus_admin: true,
      tpt_doi: true,
      gvcn: false,
      red_flag: true,
      viewer: false,
    },
    {
      feature: 'Chỉ xem lớp mình phụ trách & Gửi phản hồi điều chỉnh',
      super_admin: false,
      bgh: false,
      campus_admin: false,
      tpt_doi: false,
      gvcn: true,
      red_flag: false,
      viewer: false,
    },
    {
      feature: 'Duyệt phản hồi & điều chỉnh điểm của GVCN',
      super_admin: true,
      bgh: true,
      campus_admin: true,
      tpt_doi: true,
      gvcn: false,
      red_flag: false,
      viewer: false,
    },
    {
      feature: 'Xem báo cáo & Bảng xếp hạng',
      super_admin: true,
      bgh: true,
      campus_admin: true,
      tpt_doi: true,
      gvcn: true,
      red_flag: true,
      viewer: true,
    },
    {
      feature: 'Xem Nhật ký kiểm toán hệ thống (Audit Log)',
      super_admin: true,
      bgh: true,
      campus_admin: false,
      tpt_doi: false,
      gvcn: false,
      red_flag: false,
      viewer: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">
            <Users2 size={16} />
            <span>Hệ thống phân quyền 7 vai trò (RBAC)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Quản Lý Tài Khoản & Phân Quyền Sư Phạm
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Kiểm soát quyền truy cập chặt chẽ ở cả giao diện và cơ sở dữ liệu cho 7 vai trò:
            Super Admin, Ban Giám Hiệu, Quản trị viên phân hiệu, TPT Đội, GVCN, Đội Cờ Đỏ và Người xem.
          </p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-colors shadow-sm cursor-pointer shrink-0"
          >
            <Plus size={16} />
            <span>Thêm tài khoản mới</span>
          </button>
        )}
      </div>

      {/* Current Active User Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="text-xs text-blue-600 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <span>Tài khoản đang đăng nhập</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            </div>
            <div className="text-lg font-black text-slate-900 leading-tight">
              {currentUser.name}
            </div>
            <div className="text-xs text-slate-600 mt-0.5">
              {currentUser.title} · <span className="font-mono text-slate-500">{currentUser.email}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${ROLE_METADATA[userRole]?.badgeColor || 'bg-white text-slate-700'}`}>
            Vai trò: {ROLE_METADATA[userRole]?.name}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo họ tên, chức danh, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-500 shrink-0" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs sm:text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">Tất cả 7 vai trò ({users.length})</option>
            <option value="super_admin">1. Super Admin</option>
            <option value="bgh">2. Ban Giám Hiệu</option>
            <option value="campus_admin">3. Quản trị viên phân hiệu</option>
            <option value="tpt_doi">4. TPT Đội / Phụ trách Đội</option>
            <option value="gvcn">5. Giáo viên chủ nhiệm</option>
            <option value="red_flag">6. Đội Cờ đỏ</option>
            <option value="viewer">7. Người xem</option>
          </select>
        </div>
      </div>

      {/* Users Grid */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((u) => {
            const meta = ROLE_METADATA[u.role] || {
              name: u.role,
              badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
              description: 'Người dùng hệ thống',
            };
            const Icon = getRoleIcon(u.role);
            const isSelected = u.id === currentUser.id;
            const camp = campuses.find((c) => c.id === u.campusId);
            const cls = classes.find((c) => c.id === u.classId);

            return (
              <div
                key={u.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1 ${meta.badgeColor}`}
                    >
                      <Icon size={12} />
                      <span>{meta.name}</span>
                    </span>

                    <div className="flex items-center gap-1">
                      {isSelected && (
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                          Đang dùng
                        </span>
                      )}
                      {isSuperAdmin && (
                        <>
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Sửa tài khoản"
                          >
                            <Edit2 size={13} />
                          </button>
                          {u.id !== currentUser.id && (
                            <button
                              onClick={() => handleDelete(u)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Xóa tài khoản"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-slate-900">{u.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{u.title}</p>
                  <p className="text-[11px] font-mono text-slate-400 mt-1">{u.email}</p>

                  {(camp || cls) && (
                    <div className="mt-3 p-2 bg-slate-50 rounded-lg text-xs text-slate-600 space-y-0.5 border border-slate-100">
                      {camp && (
                        <div>
                          Phân hiệu phụ trách: <strong>{camp.name}</strong>
                        </div>
                      )}
                      {cls && (
                        <div>
                          Lớp chủ nhiệm: <strong>Lớp {cls.name}</strong>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-slate-500 mt-3 italic leading-relaxed">{meta.description}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => switchCurrentUser(u.id)}
                    disabled={isSelected}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-100 text-blue-700 cursor-default'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    <span>{isSelected ? 'Tài khoản hiện tại' : 'Chuyển sang vai trò này'}</span>
                    {!isSelected && <ArrowRight size={13} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Permissions Matrix Table for All 7 Roles */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Ma Trận Quyền Hạn Chi Tiết Cho 7 Vai Trò (RBAC Constitution)
            </h3>
            <p className="text-xs text-slate-500">
              Quy chuẩn phân quyền thực thi trên cả Giao diện (UI) và API máy chủ dữ liệu.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <th className="py-3 px-3 min-w-[240px]">Chức năng / Quyền hạn</th>
                <th className="py-3 px-2 text-center text-purple-700">1. Super Admin</th>
                <th className="py-3 px-2 text-center text-amber-700">2. BGH</th>
                <th className="py-3 px-2 text-center text-emerald-700">3. QTV Phân hiệu</th>
                <th className="py-3 px-2 text-center text-cyan-700">4. TPT Đội</th>
                <th className="py-3 px-2 text-center text-blue-700">5. GVCN</th>
                <th className="py-3 px-2 text-center text-rose-700">6. Cờ đỏ</th>
                <th className="py-3 px-2 text-center text-slate-700">7. Người xem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {permissionsMatrix.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-slate-800">{row.feature}</td>
                  <td className="py-2.5 px-2 text-center">
                    {row.super_admin ? <Check size={15} className="text-emerald-600 inline" /> : <X size={15} className="text-slate-300 inline" />}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    {row.bgh ? <Check size={15} className="text-emerald-600 inline" /> : <X size={15} className="text-slate-300 inline" />}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    {row.campus_admin ? <Check size={15} className="text-emerald-600 inline" /> : <X size={15} className="text-slate-300 inline" />}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    {row.tpt_doi ? <Check size={15} className="text-emerald-600 inline" /> : <X size={15} className="text-slate-300 inline" />}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    {row.gvcn ? <Check size={15} className="text-emerald-600 inline" /> : <X size={15} className="text-slate-300 inline" />}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    {row.red_flag ? <Check size={15} className="text-emerald-600 inline" /> : <X size={15} className="text-slate-300 inline" />}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    {row.viewer ? <Check size={15} className="text-emerald-600 inline" /> : <X size={15} className="text-slate-300 inline" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base sm:text-lg flex items-center gap-2">
                <Users2 size={18} className="text-blue-600" />
                {modalMode === 'create' ? 'Thêm người dùng mới vào hệ thống' : 'Chỉnh sửa thông tin tài khoản'}
              </h3>
              <button
                onClick={() => setModalMode(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-5 space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nguyễn Văn Sơn, Lê Thị Hoa..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vai trò (7 nhóm quyền) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as RoleType)}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white font-semibold"
                  >
                    <option value="super_admin">1. Super Admin</option>
                    <option value="bgh">2. Ban Giám Hiệu</option>
                    <option value="campus_admin">3. QTV Phân hiệu</option>
                    <option value="tpt_doi">4. TPT Đội</option>
                    <option value="gvcn">5. GVCN</option>
                    <option value="red_flag">6. Đội Cờ đỏ</option>
                    <option value="viewer">7. Người xem</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Chức danh / Vị trí</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Hiệu trưởng, TPT Đội, GVCN 6A..."
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email đăng nhập</label>
                <input
                  type="email"
                  placeholder="name@lehuulap.edu.vn"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5"
                />
              </div>

              {(formRole === 'campus_admin' || formRole === 'tpt_doi' || formRole === 'gvcn' || formRole === 'teacher') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phân hiệu trực thuộc</label>
                  <select
                    value={formCampusId}
                    onChange={(e) => setFormCampusId(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white"
                  >
                    <option value="">-- Chọn phân hiệu --</option>
                    {campuses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(formRole === 'gvcn' || formRole === 'teacher') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Lớp chủ nhiệm</label>
                  <select
                    value={formClassId}
                    onChange={(e) => setFormClassId(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white"
                  >
                    <option value="">-- Chọn lớp chủ nhiệm --</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        Lớp {cls.name} (Khối {cls.grade})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                >
                  {modalMode === 'create' ? 'Tạo tài khoản' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
