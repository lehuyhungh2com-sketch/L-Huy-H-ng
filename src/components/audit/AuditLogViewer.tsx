import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AuditLog, AuditAction } from '../../types';
import { ROLE_METADATA } from '../../utils/rbac';
import {
  History,
  Search,
  Filter,
  Download,
  ShieldAlert,
  ArrowRight,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  FileCode,
  Layers,
  Lock,
  Unlock,
  AlertTriangle,
} from 'lucide-react';

const ACTION_MAP: Record<
  AuditAction,
  { label: string; color: string; icon: React.ComponentType<{ size?: number; className?: string }> }
> = {
  CHOT_DU_LIEU_TUAN: { label: 'Khóa chốt dữ liệu tuần', color: 'bg-rose-50 text-rose-700 border-rose-200', icon: Lock },
  MO_KHOA_TUAN: { label: 'Mở khóa tuần', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Unlock },
  THEM_DIEM: { label: 'Thêm điểm thi đua', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle2 },
  SUA_DIEM: { label: 'Sửa điểm thi đua', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Layers },
  XOA_DIEM: { label: 'Xóa điểm thi đua', color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
  GUI_DE_NGHI_DIEU_CHINH: { label: 'Gửi đề nghị điều chỉnh', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Clock },
  DUYET_DIEU_CHINH: { label: 'Duyệt điều chỉnh điểm', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  TU_CHOI_DIEU_CHINH: { label: 'Từ chối điều chỉnh', color: 'bg-slate-50 text-slate-700 border-slate-200', icon: XCircle },
  THEM_PHAN_HIEU: { label: 'Thêm phân hiệu', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Layers },
  SUA_PHAN_HIEU: { label: 'Sửa phân hiệu', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Layers },
  XOA_PHAN_HIEU: { label: 'Xóa phân hiệu', color: 'bg-rose-50 text-rose-700 border-rose-200', icon: XCircle },
  THEM_LOP: { label: 'Thêm lớp học', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Layers },
  SUA_LOP: { label: 'Sửa thông tin lớp', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Layers },
  XOA_LOP: { label: 'Xóa lớp học', color: 'bg-rose-50 text-rose-700 border-rose-200', icon: XCircle },
  PHAN_CONG_CO_DO: { label: 'Phân công Cờ đỏ', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Clock },
  XOA_LICH_CO_DO: { label: 'Hủy lịch Cờ đỏ', color: 'bg-rose-50 text-rose-700 border-rose-200', icon: XCircle },
  THEM_NGUOI_DUNG: { label: 'Tạo tài khoản', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: User },
  SUA_NGUOI_DUNG: { label: 'Sửa tài khoản', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: User },
  XOA_NGUOI_DUNG: { label: 'Xóa tài khoản', color: 'bg-rose-50 text-rose-700 border-rose-200', icon: XCircle },
  CAP_NHAT_CAU_HINH: { label: 'Cập nhật cấu hình', color: 'bg-teal-50 text-teal-700 border-teal-200', icon: Layers },
  KHOI_PHUC_HE_THONG: { label: 'Khôi phục hệ thống', color: 'bg-orange-50 text-orange-700 border-orange-200', icon: AlertTriangle },
  CHUYEN_NAM_HOC: { label: 'Chuyển / Tạo năm học', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Layers },
  SAO_LUU_HE_THONG: { label: 'Sao lưu hệ thống', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Layers },
  PHUC_HOI_HE_THONG: { label: 'Phục hồi toàn bộ', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  XUAT_EXCEL_TONG_HOP: { label: 'Xuất báo cáo Excel', color: 'bg-teal-50 text-teal-700 border-teal-200', icon: FileCode },
  KIEM_TRA_TOAN_VEN: { label: 'Rà soát quy chuẩn', color: 'bg-sky-50 text-sky-700 border-sky-200', icon: CheckCircle2 },
};

export const AuditLogViewer: React.FC = () => {
  const { auditLogs, userRole } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActionFilter, setSelectedActionFilter] = useState<string>('all');
  const [selectedLogForDetails, setSelectedLogForDetails] = useState<AuditLog | null>(null);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (selectedActionFilter !== 'all' && log.action !== selectedActionFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesUser = log.userName.toLowerCase().includes(query);
        const matchesDetails = log.details.toLowerCase().includes(query);
        const matchesAction = (ACTION_MAP[log.action]?.label || log.action).toLowerCase().includes(query);
        const matchesEntity = (log.entityId || '').toLowerCase().includes(query);
        if (!matchesUser && !matchesDetails && !matchesAction && !matchesEntity) {
          return false;
        }
      }
      return true;
    });
  }, [auditLogs, selectedActionFilter, searchTerm]);

  const handleExportCSV = () => {
    const headers = ['Thời gian', 'Người thực hiện', 'Vai trò', 'Hành động', 'Đối tượng', 'Chi tiết'];
    const rows = filteredLogs.map((l) => [
      new Date(l.timestamp).toLocaleString('vi-VN'),
      `"${l.userName.replace(/"/g, '""')}"`,
      ROLE_METADATA[l.userRole]?.name || l.userRole,
      `"${ACTION_MAP[l.action]?.label || l.action}"`,
      l.entityType,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nhat_ky_kiem_toan_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
              <History size={22} />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
              Nhật ký kiểm toán hệ thống (Audit Log)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Ghi vết tự động mọi thao tác thêm, sửa, xóa, khóa chốt dữ liệu theo chuẩn an toàn thông tin:
            người thực hiện, thời điểm, nội dung trước, nội dung sau và hành động chi tiết.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          >
            <Download size={15} />
            <span>Xuất file CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên người thực hiện, nội dung chi tiết, mã đối tượng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-500 shrink-0" />
          <select
            value={selectedActionFilter}
            onChange={(e) => setSelectedActionFilter(e.target.value)}
            className="text-xs sm:text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">Tất cả hành động ({auditLogs.length})</option>
            <option value="CHOT_DU_LIEU_TUAN">Khóa chốt dữ liệu tuần</option>
            <option value="MO_KHOA_TUAN">Mở khóa tuần</option>
            <option value="THEM_DIEM">Thêm điểm thi đua</option>
            <option value="SUA_DIEM">Sửa điểm thi đua</option>
            <option value="XOA_DIEM">Xóa điểm thi đua</option>
            <option value="GUI_DE_NGHI_DIEU_CHINH">Đề nghị điều chỉnh (GVCN)</option>
            <option value="DUYET_DIEU_CHINH">Duyệt điều chỉnh điểm</option>
            <option value="TU_CHOI_DIEU_CHINH">Từ chối điều chỉnh</option>
            <option value="THEM_LOP">Thêm lớp học</option>
            <option value="SUA_LOP">Sửa thông tin lớp</option>
            <option value="THEM_NGUOI_DUNG">Quản lý người dùng</option>
            <option value="CAP_NHAT_CAU_HINH">Cấu hình hệ thống</option>
          </select>
        </div>
      </div>

      {/* Main Audit Log Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-44">Thời gian</th>
                <th className="py-3 px-4 w-52">Người thực hiện</th>
                <th className="py-3 px-4 w-48">Hành động</th>
                <th className="py-3 px-4">Nội dung chi tiết</th>
                <th className="py-3 px-4 text-center w-28">Trước / Sau</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <ShieldAlert size={36} className="mx-auto text-slate-300 mb-2" />
                    Không tìm thấy bản ghi kiểm toán nào phù hợp điều kiện lọc.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const actionMeta = ACTION_MAP[log.action] || {
                    label: log.action,
                    color: 'bg-slate-100 text-slate-700 border-slate-200',
                    icon: History,
                  };
                  const ActionIcon = actionMeta.icon;
                  const roleMeta = ROLE_METADATA[log.userRole];

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Thời gian */}
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        <div className="font-medium text-slate-800">
                          {new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(log.timestamp).toLocaleDateString('vi-VN')}
                        </div>
                      </td>

                      {/* Người thực hiện */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 truncate max-w-[200px]">
                          {log.userName}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                              roleMeta ? roleMeta.badgeColor : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {roleMeta ? roleMeta.name : log.userRole}
                          </span>
                        </div>
                      </td>

                      {/* Hành động */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${actionMeta.color}`}
                        >
                          <ActionIcon size={12} />
                          <span>{actionMeta.label}</span>
                        </span>
                      </td>

                      {/* Chi tiết */}
                      <td className="py-3 px-4 text-slate-700 leading-snug">
                        <div>{log.details}</div>
                        {log.entityId && (
                          <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                            Mã: {log.entityId} {log.campusId ? `| Phân hiệu: ${log.campusId}` : ''}
                          </div>
                        )}
                      </td>

                      {/* Đối chiếu trước / sau */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedLogForDetails(log)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
                        >
                          <Eye size={13} />
                          <span>So sánh</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog for Before / After Data Inspection */}
      {selectedLogForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                    <FileCode size={18} />
                  </span>
                  <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                    Chi tiết đối chiếu: {ACTION_MAP[selectedLogForDetails.action]?.label || selectedLogForDetails.action}
                  </h3>
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                  <span>Thực hiện bởi: <strong className="text-slate-700">{selectedLogForDetails.userName}</strong></span>
                  <span>Thời gian: {new Date(selectedLogForDetails.timestamp).toLocaleString('vi-VN')}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedLogForDetails(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100 text-xs sm:text-sm text-blue-900">
                <strong>Nội dung tóm tắt:</strong> {selectedLogForDetails.details}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Before State */}
                <div className="rounded-xl border border-slate-200 overflow-hidden flex flex-col bg-slate-900 text-slate-200">
                  <div className="px-4 py-2.5 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      NỘI DUNG TRƯỚC THAO TÁC
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {selectedLogForDetails.beforeData ? 'Có dữ liệu' : 'Khởi tạo mới'}
                    </span>
                  </div>
                  <pre className="p-4 text-xs font-mono overflow-x-auto flex-1 max-h-72 leading-relaxed text-slate-300">
                    {selectedLogForDetails.beforeData
                      ? JSON.stringify(selectedLogForDetails.beforeData, null, 2)
                      : '// Không có dữ liệu trước đó (Bản ghi được thêm mới)'}
                  </pre>
                </div>

                {/* After State */}
                <div className="rounded-xl border border-slate-200 overflow-hidden flex flex-col bg-slate-900 text-slate-200">
                  <div className="px-4 py-2.5 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      NỘI DUNG SAU THAO TÁC
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {selectedLogForDetails.afterData ? 'Dữ liệu mới' : 'Đã xóa'}
                    </span>
                  </div>
                  <pre className="p-4 text-xs font-mono overflow-x-auto flex-1 max-h-72 leading-relaxed text-emerald-300">
                    {selectedLogForDetails.afterData
                      ? JSON.stringify(selectedLogForDetails.afterData, null, 2)
                      : '// Dữ liệu đã bị xóa khỏi hệ thống'}
                  </pre>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedLogForDetails(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Đóng đối chiếu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
