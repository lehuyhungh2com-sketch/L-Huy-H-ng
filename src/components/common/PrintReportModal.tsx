import React from 'react';
import { RankingEntry } from '../../types';
import { X, Printer, Download } from 'lucide-react';

interface PrintReportModalProps {
  periodTitle: string;
  scopeTitle: string;
  rankings: RankingEntry[];
  onClose: () => void;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  periodTitle,
  scopeTitle,
  rankings,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-300">
        {/* Top bar modal control (hidden when printed) */}
        <div className="no-print p-4 border-b border-slate-200 flex items-center justify-between bg-slate-100">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-sm sm:text-base">
              Xem trước văn bản in - Báo cáo thi đua
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Printer size={16} />
              <span>In báo cáo / Lưu PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Paper Area */}
        <div className="print-container flex-1 overflow-y-auto p-6 sm:p-10 font-serif text-slate-900 bg-white">
          {/* Official Administrative Vietnamese Header */}
          <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-300 text-xs sm:text-sm">
            <div className="text-center space-y-1">
              <div className="font-semibold uppercase tracking-wide">PHÒNG GD&ĐT HUYỆN HẬU LỘC</div>
              <div className="font-bold uppercase tracking-wide">TRƯỜNG THCS LÊ HỮU LẬP</div>
              <div className="text-[11px] text-slate-600 italic">Số: 26/BC-TĐ-LHL</div>
            </div>
            <div className="text-center space-y-1">
              <div className="font-bold uppercase tracking-wide">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
              <div className="font-semibold underline decoration-slate-400 underline-offset-4">
                Độc lập – Tự do – Hạnh phúc
              </div>
              <div className="text-[11px] text-slate-600 italic pt-1">
                Hậu Lộc, ngày {currentDate.split('/')[0]} tháng {currentDate.split('/')[1]} năm 2026
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center my-6 space-y-1.5">
            <h1 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-slate-900">
              BẢNG TỔNG HỢP XẾP LOẠI THI ĐUA CÁC LỚP
            </h1>
            <p className="text-xs sm:text-sm font-medium italic text-slate-700">
              Kỳ đánh giá: {periodTitle} — Phạm vi: {scopeTitle}
            </p>
            <p className="text-xs text-slate-500 font-sans">
              Năm học 2026 – 2027 (Quy chuẩn bắt đầu 100 điểm/tuần)
            </p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto my-4">
            <table className="w-full border-collapse border border-slate-800 text-[11px] sm:text-xs">
              <thead>
                <tr className="bg-slate-100 text-center font-bold">
                  <th className="border border-slate-700 p-2 w-12">Hạng</th>
                  <th className="border border-slate-700 p-2">Lớp</th>
                  <th className="border border-slate-700 p-2">Khối</th>
                  <th className="border border-slate-700 p-2">Phân hiệu</th>
                  <th className="border border-slate-700 p-2">Giáo viên chủ nhiệm</th>
                  <th className="border border-slate-700 p-2 w-16">Điểm gốc</th>
                  <th className="border border-slate-700 p-2 w-16 text-emerald-800">Thưởng (+)</th>
                  <th className="border border-slate-700 p-2 w-16 text-rose-800">Phạt (-)</th>
                  <th className="border border-slate-700 p-2 w-20 bg-slate-200">Tổng điểm</th>
                  <th className="border border-slate-700 p-2">Xếp loại</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((r) => (
                  <tr key={r.classItem.id} className="text-center hover:bg-slate-50">
                    <td className="border border-slate-700 p-1.5 font-bold tabular-nums">
                      {r.rank}
                    </td>
                    <td className="border border-slate-700 p-1.5 font-bold text-left px-2">
                      Lớp {r.classItem.name}
                    </td>
                    <td className="border border-slate-700 p-1.5">Khối {r.classItem.grade}</td>
                    <td className="border border-slate-700 p-1.5 text-left px-2">
                      {r.campus.name}
                    </td>
                    <td className="border border-slate-700 p-1.5 text-left px-2">
                      {r.classItem.homeroomTeacher}
                    </td>
                    <td className="border border-slate-700 p-1.5 tabular-nums">100</td>
                    <td className="border border-slate-700 p-1.5 tabular-nums text-emerald-700 font-medium">
                      +{r.bonusPoints || 0}
                    </td>
                    <td className="border border-slate-700 p-1.5 tabular-nums text-rose-700 font-medium">
                      -{r.penaltyPoints || 0}
                    </td>
                    <td className="border border-slate-700 p-1.5 font-bold text-base bg-slate-100 tabular-nums">
                      {r.totalScore}
                    </td>
                    <td className="border border-slate-700 p-1.5 font-semibold">
                      {r.performanceTier}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary & Signatures */}
          <div className="grid grid-cols-3 gap-4 text-center mt-10 text-xs sm:text-sm font-serif pt-4">
            <div className="space-y-1">
              <div className="font-semibold uppercase">NGƯỜI LẬP BẢNG</div>
              <div className="text-[11px] text-slate-500 italic">(Ký, ghi rõ họ tên)</div>
              <div className="h-16"></div>
              <div className="font-bold">Cô Lê Thị Hoa</div>
              <div className="text-[11px] text-slate-600">Tổng phụ trách Đội</div>
            </div>

            <div className="space-y-1">
              <div className="font-semibold uppercase">PHỤ TRÁCH THI ĐUA</div>
              <div className="text-[11px] text-slate-500 italic">(Ký, ghi rõ họ tên)</div>
              <div className="h-16"></div>
              <div className="font-bold">Thầy Hoàng Văn Sơn</div>
              <div className="text-[11px] text-slate-600">Phó Hiệu trưởng</div>
            </div>

            <div className="space-y-1">
              <div className="font-semibold uppercase">HIỆU TRƯỞNG</div>
              <div className="text-[11px] text-slate-500 italic">(Ký, đóng dấu)</div>
              <div className="h-16"></div>
              <div className="font-bold">Thầy Nguyễn Văn Sơn</div>
              <div className="text-[11px] text-slate-600">Hiệu trưởng nhà trường</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
