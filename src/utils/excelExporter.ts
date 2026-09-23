import { ClassItem, Campus, ScoreLog, Criteria, SchoolSettings, RankingEntry } from '../types';

/**
 * Universal Excel Exporter for THCS Lê Hữu Lập
 * Generates rich, formatted Excel Workbooks (.xls HTML spreadsheet / CSV UTF-8 BOM)
 * with native Excel formulas (=SUM, =RANK, =IF) for 100% offline standby capability!
 */

/** Helper: download file to user's browser */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Format number for Vietnamese Excel presentation */
function fmtNum(n: number): string {
  if (Number.isInteger(n)) return n.toString();
  return n.toFixed(1).replace('.', ',');
}

// --------------------------------------------------------------------------
// 1. SỔ CHẤM ĐIỂM & ĐÁNH GIÁ NỀ NẾP OFFLINE DỰ PHÒNG (VỚI CÔNG THỨC EXCEL TỰ ĐỘNG)
// --------------------------------------------------------------------------
/**
 * Generates a stand-alone Offline Evaluation Excel Sheet with native formulas embedded.
 * Even if the software or internet is completely unavailable, teachers and staff can
 * open this Excel workbook, enter weekly violations/bonuses, and Excel will automatically
 * calculate total scores, rankings, and classification!
 */
export function exportOfflineStandbyEvaluationBook(
  classes: ClassItem[],
  campuses: Campus[],
  settings: SchoolSettings,
  weekNumber: number
) {
  const campusMap = new Map(campuses.map((c) => [c.id, c.name]));
  const sortedClasses = [...classes].sort((a, b) => {
    if (a.campusId !== b.campusId) return a.campusId.localeCompare(b.campusId);
    if (a.grade !== b.grade) return a.grade - b.grade;
    return a.name.localeCompare(b.name, undefined, { numeric: true });
  });

  const headerTitle = `TRƯỜNG THCS LÊ HỮU LẬP - BẢNG ĐIỂM THI ĐUA NỀ NẾP TUẦN ${weekNumber} (BẢN DỰ PHÒNG OFFLINE)`;
  const dateStr = new Date().toLocaleDateString('vi-VN');

  let html = `
  <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <!--[if gte mso 9]>
    <xml>
      <x:ExcelWorkbook>
        <x:ExcelWorksheets>
          <x:ExcelWorksheet>
            <x:Name>Thi Dua Tuan ${weekNumber}</x:Name>
            <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
          </x:ExcelWorksheet>
        </x:ExcelWorksheets>
      </x:ExcelWorkbook>
    </xml>
    <![endif]-->
    <style>
      body { font-family: "Times New Roman", Times, serif; font-size: 11pt; }
      .header-title { font-size: 14pt; font-weight: bold; text-align: center; color: #0c2340; }
      .sub-title { font-size: 11pt; font-style: italic; text-align: center; margin-bottom: 12px; }
      .notice-box { font-size: 10pt; color: #856404; background-color: #fff3cd; border: 1px solid #ffeeba; padding: 8px; }
      table { border-collapse: collapse; width: 100%; }
      th { background-color: #1a4480; color: #ffffff; border: 1px solid #000000; font-weight: bold; text-align: center; vertical-align: middle; padding: 6px; }
      td { border: 1px solid #000000; padding: 5px; vertical-align: middle; }
      .num-cell { text-align: right; mso-number-format: "0\\.0"; }
      .int-cell { text-align: center; mso-number-format: "0"; }
      .center-cell { text-align: center; }
      .bold-cell { font-weight: bold; }
      .formula-cell { font-weight: bold; background-color: #f0f7ff; color: #004085; text-align: right; }
      .rank-cell { font-weight: bold; text-align: center; background-color: #fff8e1; }
      .tier-cell { text-align: center; font-weight: bold; }
      .footer-sign { margin-top: 25px; text-align: center; font-weight: bold; }
    </style>
  </head>
  <body>
    <table>
      <tr>
        <td colspan="4" style="text-align: center; font-weight: bold; border: none;">
          PHÒNG GD&ĐT HẬU LỘC<br>
          <strong>TRƯỜNG THCS LÊ HỮU LẬP</strong>
        </td>
        <td colspan="8" style="text-align: center; font-weight: bold; border: none;">
          CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM<br>
          Độc lập - Tự do - Hạnh phúc
        </td>
      </tr>
      <tr><td colspan="12" style="border: none; height: 15px;"></td></tr>
      <tr>
        <td colspan="12" class="header-title" style="border: none;">
          ${headerTitle}
        </td>
      </tr>
      <tr>
        <td colspan="12" class="sub-title" style="border: none;">
          Năm học: ${settings.academicYear} · Điểm cơ sở: ${settings.basePointsPerWeek} điểm · Xuất ngày: ${dateStr}
        </td>
      </tr>
      <tr>
        <td colspan="12" class="notice-box" style="border: 1px solid #ffeeba;">
          <strong>* HƯỚNG DẪN DÙNG OFFLINE:</strong> Bảng tính này đã tích hợp sẵn công thức tính điểm và tự động xếp hạng cho 59 lớp.
          Thầy cô chỉ cần nhập điểm trừ hoặc điểm thưởng vào các cột từ [E] đến [K], cột [L] (Tổng điểm), [M] (Xếp hạng) và [N] (Xếp loại) sẽ <strong>tự động nhảy kết quả</strong> mà không cần phần mềm!
        </td>
      </tr>
      <tr><td colspan="12" style="border: none; height: 10px;"></td></tr>
      <thead>
        <tr>
          <th rowspan="2" style="width: 35px;">STT</th>
          <th rowspan="2" style="width: 60px;">Lớp</th>
          <th rowspan="2" style="width: 140px;">Phân hiệu</th>
          <th rowspan="2" style="width: 130px;">GVCN</th>
          <th rowspan="2" style="width: 65px;">Điểm gốc</th>
          <th colspan="4" style="background-color: #8b0000;">CÁC KHOẢN ĐIỂM TRỪ NỀ NẾP (NHẬP SỐ DƯƠNG)</th>
          <th colspan="2" style="background-color: #006400;">CỘNG THƯỞNG</th>
          <th rowspan="2" style="width: 80px; background-color: #0c2340;">TỔNG ĐIỂM<br>(Tự động)</th>
          <th rowspan="2" style="width: 65px; background-color: #b8860b;">HẠNG<br>(Tự động)</th>
          <th rowspan="2" style="width: 95px; background-color: #2e8b57;">XẾP LOẠI<br>(Tự động)</th>
        </tr>
        <tr>
          <th style="width: 70px; background-color: #b22222;">Chuyên cần & Kỷ luật</th>
          <th style="width: 70px; background-color: #b22222;">Tác phong & Đồng phục</th>
          <th style="width: 70px; background-color: #b22222;">Vệ sinh & Bán trú</th>
          <th style="width: 70px; background-color: #b22222;">Điểm yếu Học tập</th>
          <th style="width: 70px; background-color: #228b22;">Điểm tốt Học tập</th>
          <th style="width: 70px; background-color: #228b22;">Khen thưởng / Việc tốt</th>
        </tr>
      </thead>
      <tbody>
  `;

  // Start data row index (Excel is 1-indexed, headers end at row 11)
  const startRow = 12;
  const endRow = startRow + sortedClasses.length - 1;

  sortedClasses.forEach((cls, idx) => {
    const rowNum = startRow + idx;
    const campusName = campusMap.get(cls.campusId) || 'Phân hiệu';

    // Formula for Total Score: Base - (Sum of Penalties) + (Sum of Bonuses)
    // Base is Column E, Penalties are F to I, Bonuses are J to K
    const totalScoreFormula = `=E${rowNum}-SUM(F${rowNum}:I${rowNum})+SUM(J${rowNum}:K${rowNum})`;

    // Formula for Rank: =RANK(L{rowNum}, $L$12:$L${endRow})
    const rankFormula = `=RANK(L${rowNum}, $L$${startRow}:$L$${endRow})`;

    // Formula for Tier: =IF(L>=95, "Xuất sắc", IF(L>=85, "Tiên tiến", IF(L>=70, "Đạt", "Cần cố gắng")))
    const tierFormula = `=IF(L${rowNum}>=95,"Xuất sắc",IF(L${rowNum}>=85,"Tiên tiến",IF(L${rowNum}>=70,"Đạt","Cần cố gắng")))`;

    html += `
      <tr>
        <td class="center-cell">${idx + 1}</td>
        <td class="center-cell bold-cell" style="font-size: 11pt; color: #1a4480;">${cls.name}</td>
        <td>${campusName}</td>
        <td>${cls.homeroomTeacher}</td>
        <td class="num-cell bold-cell">${settings.basePointsPerWeek}</td>
        <td class="num-cell">0</td>
        <td class="num-cell">0</td>
        <td class="num-cell">0</td>
        <td class="num-cell">0</td>
        <td class="num-cell">0</td>
        <td class="num-cell">0</td>
        <td class="formula-cell" x:fmla="${totalScoreFormula}">${settings.basePointsPerWeek}</td>
        <td class="rank-cell" x:fmla="${rankFormula}">1</td>
        <td class="tier-cell" x:fmla="${tierFormula}">Xuất sắc</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>

    <table style="border: none; margin-top: 30px; width: 100%;">
      <tr style="border: none;">
        <td colspan="4" style="text-align: center; border: none; vertical-align: top; width: 33%;">
          <strong>TỔNG PHỤ TRÁCH ĐỘI</strong><br>
          <span style="font-size: 10pt; font-style: italic;">(Ký và ghi rõ họ tên)</span>
          <br><br><br><br>
          <strong>Lê Thị Hoa</strong>
        </td>
        <td colspan="4" style="text-align: center; border: none; vertical-align: top; width: 33%;">
          <strong>PHỤ TRÁCH PHÂN HIỆU</strong><br>
          <span style="font-size: 10pt; font-style: italic;">(Ký và ghi rõ họ tên)</span>
          <br><br><br><br>
          <strong>Đại diện 6 phân hiệu</strong>
        </td>
        <td colspan="4" style="text-align: center; border: none; vertical-align: top; width: 34%;">
          <strong>HIỆU TRƯỞNG</strong><br>
          <span style="font-size: 10pt; font-style: italic;">(Ký tên và đóng dấu)</span>
          <br><br><br><br>
          <strong>Nguyễn Văn Sơn</strong>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  downloadFile(
    html,
    `Bang_Diem_Offline_Du_Phong_Tuan_${weekNumber}_THCS_LeHuuLap.xls`,
    'application/vnd.ms-excel;charset=utf-8;'
  );
}

// --------------------------------------------------------------------------
// 2. XUẤT BẢNG TỔNG HỢP XẾP HẠNG THI ĐUA ĐẦY ĐỦ (TUẦN / THÁNG / KỲ / NĂM)
// --------------------------------------------------------------------------
export function exportRankingsToExcel(
  rankings: RankingEntry[],
  periodTitle: string,
  academicYear: string,
  scopeTitle: string
) {
  const dateStr = new Date().toLocaleDateString('vi-VN');

  let html = `
  <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <style>
      body { font-family: "Times New Roman", Times, serif; font-size: 11pt; }
      .header-title { font-size: 14pt; font-weight: bold; text-align: center; color: #0c2340; }
      .sub-title { font-size: 11pt; font-style: italic; text-align: center; margin-bottom: 12px; }
      table { border-collapse: collapse; width: 100%; }
      th { background-color: #0c2340; color: #ffffff; border: 1px solid #000000; font-weight: bold; text-align: center; padding: 6px; }
      td { border: 1px solid #000000; padding: 5px; }
      .center { text-align: center; }
      .right { text-align: right; }
      .bold { font-weight: bold; }
    </style>
  </head>
  <body>
    <table>
      <tr>
        <td colspan="3" style="text-align: center; font-weight: bold; border: none;">
          TRƯỜNG THCS LÊ HỮU LẬP
        </td>
        <td colspan="7" style="text-align: center; font-weight: bold; border: none;">
          CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM<br>Độc lập - Tự do - Hạnh phúc
        </td>
      </tr>
      <tr><td colspan="10" style="border: none; height: 10px;"></td></tr>
      <tr>
        <td colspan="10" class="header-title" style="border: none;">
          BẢNG XẾP HẠNG THI ĐUA NỀ NẾP - ${periodTitle.toUpperCase()}
        </td>
      </tr>
      <tr>
        <td colspan="10" class="sub-title" style="border: none;">
          Phạm vi: ${scopeTitle} · Năm học: ${academicYear} · Ngày xuất: ${dateStr}
        </td>
      </tr>
      <thead>
        <tr>
          <th style="width: 45px;">Hạng</th>
          <th style="width: 70px;">Lớp</th>
          <th style="width: 50px;">Khối</th>
          <th style="width: 140px;">Phân hiệu</th>
          <th style="width: 140px;">GVCN</th>
          <th style="width: 65px;">Điểm gốc</th>
          <th style="width: 75px;">Điểm cộng</th>
          <th style="width: 75px;">Điểm trừ</th>
          <th style="width: 85px;">Tổng điểm</th>
          <th style="width: 110px;">Xếp loại thi đua</th>
        </tr>
      </thead>
      <tbody>
  `;

  rankings.forEach((r) => {
    const bonus = r.bonusPoints || r.monthBonusPoints || r.yearBonusPoints || 0;
    const penalty = r.penaltyPoints || r.monthPenaltyPoints || 0;

    html += `
      <tr>
        <td class="center bold" style="background-color: ${r.rank <= 3 ? '#fff3cd' : '#ffffff'};">${r.isDisqualifiedYearly ? 'Không XL' : r.rank}</td>
        <td class="center bold">${r.classItem.name}</td>
        <td class="center">${r.classItem.grade}</td>
        <td>${r.campus.name}</td>
        <td>${r.classItem.homeroomTeacher}</td>
        <td class="right">${r.baseScore}</td>
        <td class="right" style="color: #28a745;">+${fmtNum(bonus)}</td>
        <td class="right" style="color: #dc3545;">-${fmtNum(penalty)}</td>
        <td class="right bold" style="font-size: 11pt; color: #004085;">${fmtNum(r.totalScore)}</td>
        <td class="center bold">${r.performanceTier}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>

    <table style="border: none; margin-top: 30px; width: 100%;">
      <tr style="border: none;">
        <td colspan="5" style="text-align: center; border: none; font-weight: bold;">
          TỔNG PHỤ TRÁCH ĐỘI<br><br><br><br>
          Lê Thị Hoa
        </td>
        <td colspan="5" style="text-align: center; border: none; font-weight: bold;">
          HIỆU TRƯỞNG<br><br><br><br>
          Nguyễn Văn Sơn
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  downloadFile(
    html,
    `Bang_Xep_Hang_${periodTitle.replace(/\s+/g, '_')}_THCS_LeHuuLap.xls`,
    'application/vnd.ms-excel;charset=utf-8;'
  );
}

// --------------------------------------------------------------------------
// 3. XUẤT SỔ NHẬT KÝ THEO DÕI VI PHẠM & KHEN THƯỞNG CHI TIẾT (AUDIT RECORD BOOK)
// --------------------------------------------------------------------------
export function exportScoreLogsToExcel(
  logs: ScoreLog[],
  academicYear: string,
  filterDescription: string = 'Toàn bộ năm học'
) {
  const dateStr = new Date().toLocaleDateString('vi-VN');

  let html = `
  <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <style>
      body { font-family: "Times New Roman", Times, serif; font-size: 10pt; }
      .header-title { font-size: 13pt; font-weight: bold; text-align: center; color: #0c2340; }
      table { border-collapse: collapse; width: 100%; }
      th { background-color: #1a4480; color: #ffffff; border: 1px solid #000000; font-weight: bold; text-align: center; padding: 5px; }
      td { border: 1px solid #000000; padding: 4px; }
      .center { text-align: center; }
      .right { text-align: right; }
      .bold { font-weight: bold; }
    </style>
  </head>
  <body>
    <table>
      <tr>
        <td colspan="10" class="header-title" style="border: none;">
          SỔ NHẬT KÝ GHI NHẬN NỀ NẾP & THI ĐUA CHI TIẾT - NĂM HỌC ${academicYear}
        </td>
      </tr>
      <tr>
        <td colspan="10" style="text-align: center; font-style: italic; border: none; margin-bottom: 10px;">
          Lọc: ${filterDescription} · Ngày xuất: ${dateStr} · Tổng số bản ghi: ${logs.length}
        </td>
      </tr>
      <thead>
        <tr>
          <th style="width: 35px;">STT</th>
          <th style="width: 45px;">Tuần</th>
          <th style="width: 75px;">Ngày</th>
          <th style="width: 130px;">Phân hiệu</th>
          <th style="width: 60px;">Lớp</th>
          <th style="width: 60px;">Mã TC</th>
          <th style="width: 220px;">Nội dung Tiêu chí</th>
          <th style="width: 60px;">Số điểm</th>
          <th style="width: 200px;">Chi tiết / Học sinh / Tiết học</th>
          <th style="width: 120px;">Cán bộ chấm</th>
        </tr>
      </thead>
      <tbody>
  `;

  logs.forEach((l, idx) => {
    const isPenalty = l.type === 'penalty' || l.totalPoints < 0;
    const pts = isPenalty ? `-${Math.abs(l.totalPoints)}` : `+${l.totalPoints}`;
    const color = isPenalty ? '#dc3545' : '#28a745';

    html += `
      <tr>
        <td class="center">${idx + 1}</td>
        <td class="center bold">${l.week}</td>
        <td class="center">${l.date}</td>
        <td>${l.campusName}</td>
        <td class="center bold">${l.className}</td>
        <td class="center">${l.criteriaCode}</td>
        <td>${l.criteriaName}</td>
        <td class="right bold" style="color: ${color};">${pts}đ</td>
        <td>${l.note || l.calculationDetail || ''}</td>
        <td>${l.inspectorName || l.recordedBy}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  </body>
  </html>
  `;

  downloadFile(
    html,
    `So_Nhat_Ky_Thi_Dua_${academicYear}_THCS_LeHuuLap.xls`,
    'application/vnd.ms-excel;charset=utf-8;'
  );
}

// --------------------------------------------------------------------------
// 4. XUẤT BẢNG QUY CHUẨN 64 TIÊU CHÍ THI ĐUA THEO CÔNG VĂN CHÍNH THỨC
// --------------------------------------------------------------------------
export function exportCriteriaCatalogToExcel(criteriaList: Criteria[], academicYear: string) {
  let html = `
  <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <style>
      body { font-family: "Times New Roman", Times, serif; font-size: 11pt; }
      table { border-collapse: collapse; width: 100%; }
      th { background-color: #0c2340; color: #ffffff; border: 1px solid #000000; font-weight: bold; text-align: center; padding: 6px; }
      td { border: 1px solid #000000; padding: 5px; }
    </style>
  </head>
  <body>
    <table>
      <tr>
        <td colspan="7" style="font-size: 14pt; font-weight: bold; text-align: center; border: none; color: #0c2340;">
          QUY CHUẨN DANH MỤC TIÊU CHÍ THI ĐUA NỀ NẾP HỌC SINH NĂM HỌC ${academicYear}
        </td>
      </tr>
      <tr>
        <td colspan="7" style="text-align: center; font-style: italic; border: none; margin-bottom: 12px;">
          Theo Quy chế Thi đua - Nề nếp Trường THCS Lê Hữu Lập (Áp dụng Trường chính và 5 Phân hiệu)
        </td>
      </tr>
      <thead>
        <tr>
          <th style="width: 60px;">Mã TC</th>
          <th style="width: 140px;">Mảng / Danh mục</th>
          <th style="width: 250px;">Tên Tiêu chí / Hành vi</th>
          <th style="width: 80px;">Loại</th>
          <th style="width: 80px;">Mức điểm</th>
          <th style="width: 120px;">Phạm vi áp dụng</th>
          <th style="width: 240px;">Quy chuẩn chi tiết & Điều kiện</th>
        </tr>
      </thead>
      <tbody>
  `;

  criteriaList.forEach((c) => {
    const typeLabel = c.type === 'bonus' ? 'Cộng thưởng' : 'Trừ điểm';
    const typeColor = c.type === 'bonus' ? '#28a745' : '#dc3545';
    const scopeLabel =
      c.scope === 'main_only'
        ? 'Chỉ Trường chính'
        : c.scope === 'sub_only'
        ? 'Chỉ Phân hiệu'
        : c.scope === 'sub_with_badge'
        ? 'Phân hiệu đeo băng đỏ'
        : 'Toàn bộ 6 phân hiệu';

    html += `
      <tr>
        <td style="text-align: center; font-weight: bold;">${c.code}</td>
        <td>${c.category}</td>
        <td><strong>${c.name}</strong></td>
        <td style="text-align: center; font-weight: bold; color: ${typeColor};">${typeLabel}</td>
        <td style="text-align: right; font-weight: bold;">${c.points > 0 ? `+${c.points}` : c.points}đ / ${c.unit}</td>
        <td>${scopeLabel}</td>
        <td>${c.condition || c.description || ''}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  </body>
  </html>
  `;

  downloadFile(
    html,
    `Quy_Chuan_Tieu_Chi_Thi_Dua_${academicYear}_THCS_LeHuuLap.xls`,
    'application/vnd.ms-excel;charset=utf-8;'
  );
}
