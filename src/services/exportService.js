import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatThaiDate, formatThaiTime, toBuddhistYear, THAI_MONTH_NAMES } from '../utils/dateUtils';
import { getMonthlyMatrix } from './inspectionService';

/**
 * Export Detailed Inspections to Excel (.xlsx)
 */
export function exportInspectionsToExcel(inspections, itemsList, fileName = 'รายงานการตรวจสอบอุปกรณ์_กู้ชีพพันท้ายนรสิงห์.xlsx') {
  const rows = [];

  // Build rows mapping items to inspection headers
  inspections.forEach((insp) => {
    const matchedItems = itemsList.filter(it => it.inspection_id === insp.id);

    if (matchedItems.length === 0) {
      rows.push({
        'วันที่': formatThaiDate(insp.inspection_date),
        'ทะเบียนรถ': insp.vehicle?.license_plate || insp.vehicle_license,
        'ชื่อรถ': insp.vehicle?.vehicle_name || '',
        'เวร': insp.shift === 'MORNING' ? 'เวรเช้า' : 'เวรดึก',
        'รหัสผู้ตรวจ': insp.inspector_code,
        'ชื่อผู้ตรวจ': insp.inspector_name,
        'สถานะภาพรวม': insp.overall_status === 'COMPLETED' ? 'พร้อมใช้งานทั้งหมด' : 'พบรายการผิดปกติ',
        'รายการอุปกรณ์': 'สรุปภาพรวม',
        'เกณฑ์/ขั้นต่ำ': '-',
        'จำนวนที่ตรวจพบ': '-',
        'สถานะ': insp.overall_status === 'COMPLETED' ? 'พร้อมใช้งาน' : 'มีข้อบกพร่อง',
        'เหตุผล': insp.notes || '-',
        'เวลาที่บันทึก': formatThaiTime(insp.completed_at)
      });
    } else {
      matchedItems.forEach((item) => {
        rows.push({
          'วันที่': formatThaiDate(insp.inspection_date),
          'ทะเบียนรถ': insp.vehicle?.license_plate || insp.vehicle_license,
          'ชื่อรถ': insp.vehicle?.vehicle_name || '',
          'เวร': insp.shift === 'MORNING' ? 'เวรเช้า' : 'เวรดึก',
          'รหัสผู้ตรวจ': insp.inspector_code,
          'ชื่อผู้ตรวจ': insp.inspector_name,
          'ลำดับ': item.equipment_no,
          'รายการอุปกรณ์': item.equipment_name,
          'หมวดหมู่': item.category || '-',
          'เกณฑ์/ขั้นต่ำ': item.minimum_quantity ? `${item.minimum_quantity} ${item.unit || ''}` : '-',
          'จำนวนที่ตรวจพบ': item.available_quantity !== null ? item.available_quantity : '-',
          'สถานะ': item.status === 'READY' ? 'พร้อมใช้งาน' : (item.status === 'NOT_READY' ? 'ไม่พร้อมใช้งาน' : 'ยังไม่ได้ตรวจ'),
          'เหตุผล': item.reason || '-',
          'หมายเหตุ': item.note || '-',
          'เวลาที่บันทึก': formatThaiTime(item.checked_at || insp.completed_at)
        });
      });
    }
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'รายการตรวจอุปกรณ์');

  XLSX.writeFile(wb, fileName);
}

/**
 * Export Monthly Matrix Table for Vehicles into Excel
 */
export async function exportMonthlyMatrixExcel(vehicles, year, month) {
  const wb = XLSX.utils.book_new();
  const monthName = THAI_MONTH_NAMES[month - 1];
  const thaiYear = toBuddhistYear(year);

  for (const vehicle of vehicles) {
    const matrixData = await getMonthlyMatrix(vehicle.id, year, month);
    const rows = [];

    // Header info
    rows.push({ 'A': `ตารางตรวจสอบอุปกรณ์ประจำรถพยาบาล: ${vehicle.license_plate} (${vehicle.vehicle_name})` });
    rows.push({ 'A': `ประจำเดือน: ${monthName} พ.ศ. ${thaiYear} | หน่วยกู้ชีพเทศบาลเมืองพันท้ายนรสิงห์` });
    rows.push({}); // blank line

    // Columns
    const tableRows = matrixData.days.map((d) => ({
      'วันที่': d.day,
      'เวรเช้า (ผล)': d.morning ? (d.morning.status === 'COMPLETED' ? '✓ ผ่าน' : '⚠ มีข้อบกพร่อง') : '-',
      'ผู้ตรวจ (เช้า)': d.morning ? d.morning.inspector_code : '-',
      'ชื่อผู้ตรวจ (เช้า)': d.morning ? d.morning.inspector_name : '-',
      'เวลา (เช้า)': d.morning ? d.morning.time : '-',
      'เวรดึก (ผล)': d.night ? (d.night.status === 'COMPLETED' ? '✓ ผ่าน' : '⚠ มีข้อบกพร่อง') : '-',
      'ผู้ตรวจ (ดึก)': d.night ? d.night.inspector_code : '-',
      'ชื่อผู้ตรวจ (ดึก)': d.night ? d.night.inspector_name : '-',
      'เวลา (ดึก)': d.night ? d.night.time : '-'
    }));

    const ws = XLSX.utils.json_to_sheet(tableRows);
    XLSX.utils.book_append_sheet(wb, ws, `${vehicle.license_plate}`);
  }

  XLSX.writeFile(wb, `ตารางตรวจสอบรายเดือน_${monthName}_${thaiYear}.xlsx`);
}

/**
 * Export Official PDF Inspection Report
 * Form: "แบบตรวจสอบอุปกรณ์ประจำรถพยาบาล หน่วยกู้ชีพเทศบาลเมืองพันท้ายนรสิงห์"
 */
export function exportInspectionToPDF(inspection, items, vehicle) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const licensePlate = vehicle?.license_plate || inspection.vehicle_license || 'กข9745';
  const vehicleName = vehicle?.vehicle_name || inspection.vehicle_name || 'รถพยาบาลฉุกเฉิน';
  const thaiDateStr = formatThaiDate(inspection.inspection_date);
  const shiftText = inspection.shift === 'MORNING' ? 'เวรเช้า (08:00 - 20:00 น.)' : 'เวรดึก (20:00 - 08:00 น.)';
  const checkTime = formatThaiTime(inspection.completed_at);

  // Title Header
  doc.setFontSize(16);
  doc.setTextColor(11, 37, 69); // EMS Navy
  doc.text('แบบตรวจสอบอุปกรณ์ประจำรถพยาบาล', 105, 18, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(19, 64, 116);
  doc.text('หน่วยกู้ชีพเทศบาลเมืองพันท้ายนรสิงห์', 105, 25, { align: 'center' });

  // Metadata Card Line
  doc.setDrawColor(200, 215, 230);
  doc.setFillColor(245, 248, 252);
  doc.roundedRect(14, 30, 182, 22, 3, 3, 'FD');

  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(`รถพยาบาล: ${licensePlate} (${vehicleName})`, 18, 37);
  doc.text(`รอบการตรวจ: ${shiftText}`, 115, 37);
  doc.text(`วันที่ตรวจสอบ: ${thaiDateStr}`, 18, 46);
  doc.text(`ผู้ตรวจ: ${inspection.inspector_name} (รหัส ${inspection.inspector_code})`, 115, 46);

  // Table of 40 Items
  const tableData = items.map((item) => {
    let statusText = 'พร้อมใช้งาน';
    if (item.status === 'NOT_READY') {
      statusText = 'ไม่พร้อมใช้งาน';
    } else if (item.status === 'NOT_CHECKED') {
      statusText = 'ยังไม่ได้ตรวจ';
    }

    let qtyText = item.minimum_quantity ? `${item.minimum_quantity} ${item.unit || ''}` : '-';
    let availText = item.available_quantity !== null && item.available_quantity !== '' ? `${item.available_quantity} ${item.unit || ''}` : '-';

    return [
      item.equipment_no.toString(),
      item.equipment_name,
      qtyText,
      availText,
      statusText,
      item.reason || '-',
      item.note || '-'
    ];
  });

  doc.autoTable({
    startY: 56,
    head: [['ลำดับ', 'รายการอุปกรณ์', 'เกณฑ์ขั้นต่ำ', 'จำนวนที่พบ', 'สถานะ', 'เหตุผลกรณีไม่พร้อม', 'หมายเหตุ']],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      valign: 'middle'
    },
    headStyles: {
      fillColor: [11, 37, 69],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { cellWidth: 50 },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'center', cellWidth: 20 },
      4: { halign: 'center', cellWidth: 24 },
      5: { cellWidth: 30 },
      6: { cellWidth: 26 }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    didParseCell: function(data) {
      if (data.section === 'body' && data.column.index === 4) {
        if (data.cell.raw === 'พร้อมใช้งาน') {
          data.cell.styles.textColor = [22, 163, 74]; // Green
          data.cell.styles.fontStyle = 'bold';
        } else if (data.cell.raw === 'ไม่พร้อมใช้งาน') {
          data.cell.styles.textColor = [220, 38, 38]; // Red
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });

  // Footer Sign-Off Block
  const finalY = doc.lastAutoTable.finalY + 12;
  const pageHeight = doc.internal.pageSize.height;

  // Check if we need a new page for signature block
  let signY = finalY;
  if (finalY > pageHeight - 35) {
    doc.addPage();
    signY = 25;
  }

  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);

  // Summary counts
  const readyCount = items.filter(i => i.status === 'READY').length;
  const notReadyCount = items.filter(i => i.status === 'NOT_READY').length;

  doc.text(`สรุปผลการตรวจ: ทั้งหมด 40 รายการ | พร้อมใช้งาน: ${readyCount} รายการ | ไม่พร้อมใช้งาน: ${notReadyCount} รายการ`, 14, signY);

  // Signature lines
  doc.text('ลงชื่อผู้ตรวจสอบ ..............................................................', 115, signY + 12);
  doc.text(`( ${inspection.inspector_name} )`, 130, signY + 18);
  doc.text(`รหัสผู้ตรวจ: ${inspection.inspector_code}`, 130, signY + 24);
  doc.text(`วันที่: ${thaiDateStr}   เวลา: ${checkTime}`, 130, signY + 30);

  doc.save(`แบบตรวจอุปกรณ์_${licensePlate}_${inspection.inspection_date}_${inspection.shift}.pdf`);
}
