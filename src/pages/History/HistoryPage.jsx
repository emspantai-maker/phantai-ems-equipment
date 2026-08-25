import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  FileSpreadsheet,
  FileText,
  Calendar,
  Ambulance,
  Clock,
  Eye,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Download
} from 'lucide-react';
import { getVehicles } from '../../services/vehicleService';
import { getInspections, getInspectionDetails } from '../../services/inspectionService';
import { exportInspectionsToExcel, exportInspectionToPDF } from '../../services/exportService';
import { formatThaiDate, formatThaiTime, getMonthYearOptions } from '../../utils/dateUtils';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';

export default function HistoryPage() {
  const toast = useToast();
  const monthOptions = getMonthYearOptions();

  const [inspections, setInspections] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedShift, setSelectedShift] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Inspection Detail Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const vehList = await getVehicles();
      setVehicles(vehList);

      const filters = {};
      if (selectedVehicleId) filters.vehicleId = selectedVehicleId;
      if (selectedShift) filters.shift = selectedShift;
      if (selectedStatus) filters.status = selectedStatus;
      if (selectedMonth) {
        const [y, m] = selectedMonth.split('-');
        filters.year = y;
        filters.month = m;
      }
      if (search) filters.search = search;

      const data = await getInspections(filters);
      setInspections(data);
    } catch (err) {
      console.error('Error loading history:', err);
      toast.error('ไม่สามารถโหลดประวัติการตรวจได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [selectedVehicleId, selectedMonth, selectedShift, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadHistory();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedVehicleId('');
    setSelectedMonth('');
    setSelectedShift('');
    setSelectedStatus('');
  };

  const handleOpenDetail = async (inspId) => {
    setDetailLoading(true);
    setDetailModalOpen(true);
    try {
      const data = await getInspectionDetails(inspId);
      setSelectedDetail(data);
    } catch (err) {
      toast.error('ไม่สามารถโหลดรายละเอียดได้');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (inspections.length === 0) {
      toast.warning('ไม่พบข้อมูลสำหรับส่งออก Excel');
      return;
    }
    const allItems = JSON.parse(localStorage.getItem('phantai_ems_inspection_items_v1') || '[]');
    exportInspectionsToExcel(inspections, allItems);
    toast.success('ส่งออกรายงาน Excel สำเร็จ');
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <History className="w-6 h-6 text-ems-primary" />
            <span>ประวัติการตรวจสอบอุปกรณ์</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            บันทึกการตรวจอุปกรณ์ประจำรถพยาบาล หน่วยกู้ชีพเทศบาลเมืองพันท้ายนรสิงห์
          </p>
        </div>

        {/* Global Export Excel */}
        <button
          onClick={handleExportExcel}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition active:scale-95 flex items-center gap-2 self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>ส่งออก Excel ({inspections.length} รายการ)</span>
        </button>
      </div>

      {/* Filter Panel */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-soft space-y-4">
        
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาตามทะเบียนรถ, ชื่อผู้ตรวจ, รหัสพนักงาน, หรือ วันที่..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-ems-primary"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-ems-navy text-white text-xs font-bold rounded-xl hover:bg-ems-blue transition active:scale-95"
          >
            ค้นหา
          </button>
        </form>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          
          {/* Vehicle */}
          <select
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl p-2 font-medium text-slate-700 focus:bg-white"
          >
            <option value="">-- รถพยาบาลทุกคัน --</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.license_plate} ({v.vehicle_name})</option>
            ))}
          </select>

          {/* Month & Year (Thai Buddhist Calendar) */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl p-2 font-medium text-slate-700 focus:bg-white"
          >
            <option value="">-- ทุกเดือน --</option>
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Shift */}
          <select
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl p-2 font-medium text-slate-700 focus:bg-white"
          >
            <option value="">-- ทุกเวร --</option>
            <option value="MORNING">เวรเช้า (08:00 - 20:00)</option>
            <option value="NIGHT">เวรดึก (20:00 - 08:00)</option>
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl p-2 font-medium text-slate-700 focus:bg-white"
          >
            <option value="">-- ทุกสถานะ --</option>
            <option value="COMPLETED">🟢 พร้อมใช้งานทั้งหมด</option>
            <option value="HAS_ISSUES">🔴 พบข้อบกพร่อง/ชำรุด</option>
          </select>

        </div>

      </div>

      {/* Inspections History List Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            กำลังโหลดข้อมูลประวัติการตรวจ...
          </div>
        ) : inspections.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <History className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-700">ไม่พบประวัติการตรวจสอบ</h4>
            <p className="text-xs text-slate-400">ลองเปลี่ยนเงื่อนไขตัวกรอง หรือเริ่มตรวจอุปกรณ์ประจำรถ</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">วันที่ตรวจ</th>
                  <th className="py-3 px-4">รถพยาบาล</th>
                  <th className="py-3 px-4">รอบเวร</th>
                  <th className="py-3 px-4">ผู้ตรวจ</th>
                  <th className="py-3 px-4 text-center">พร้อม / ไม่พร้อม</th>
                  <th className="py-3 px-4 text-center">สถานะภาพรวม</th>
                  <th className="py-3 px-4 text-right">การกระทำ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {inspections.map((insp) => (
                  <tr key={insp.id} className="hover:bg-slate-50 transition-colors">
                    
                    {/* Date */}
                    <td className="py-3 px-4 font-bold text-slate-800">
                      <div>{formatThaiDate(insp.inspection_date)}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{formatThaiTime(insp.completed_at)}</div>
                    </td>

                    {/* Vehicle */}
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-ems-navy bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {insp.vehicle?.license_plate || insp.vehicle_license}
                      </span>
                    </td>

                    {/* Shift */}
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        insp.shift === 'MORNING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {insp.shift === 'MORNING' ? '☀️ เวรเช้า' : '🌙 เวรดึก'}
                      </span>
                    </td>

                    {/* Inspector */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{insp.inspector_name}</div>
                      <div className="text-[10px] text-slate-400">รหัส {insp.inspector_code}</div>
                    </td>

                    {/* Counters */}
                    <td className="py-3 px-4 text-center">
                      <span className="text-emerald-700 font-bold">{insp.ready_items || 0}</span>
                      <span className="text-slate-300 mx-1">/</span>
                      <span className="text-red-700 font-bold">{insp.not_ready_items || 0}</span>
                    </td>

                    {/* Overall Status */}
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={insp.overall_status === 'COMPLETED' ? 'READY' : 'NOT_READY'} size="sm" />
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(insp.id)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition active:scale-95 flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>ดูผล</span>
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ====================================================================== */}
      {/* INSPECTION DETAIL MODAL WITH 40 ITEMS (Requirement #42, 50) */}
      {/* ====================================================================== */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        maxWidth="max-w-3xl"
        title="รายละเอียดผลการตรวจอุปกรณ์ประจำรถ"
      >
        {detailLoading || !selectedDetail ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            กำลังโหลดรายละเอียดอุปกรณ์...
          </div>
        ) : (
          <div className="space-y-5 text-left text-xs">
            
            {/* Header info */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">รถพยาบาล</span>
                <span className="font-extrabold text-sm text-ems-navy">{selectedDetail.inspection?.vehicle?.license_plate}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">วันที่ตรวจ</span>
                <span className="font-bold text-slate-800">{formatThaiDate(selectedDetail.inspection?.inspection_date)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">รอบการตรวจ</span>
                <span className="font-bold text-slate-800">{selectedDetail.inspection?.shift === 'MORNING' ? 'เวรเช้า' : 'เวรดึก'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">ผู้ตรวจ</span>
                <span className="font-bold text-slate-800">{selectedDetail.inspection?.inspector_name} (รหัส {selectedDetail.inspection?.inspector_code})</span>
              </div>
            </div>

            {/* 40 Items Checklist Table */}
            <div className="max-h-96 overflow-y-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs">
                <thead className="bg-ems-navy text-white sticky top-0 font-bold text-[11px]">
                  <tr>
                    <th className="p-2 text-center w-10">ลำดับ</th>
                    <th className="p-2">รายการอุปกรณ์</th>
                    <th className="p-2 text-center">เกณฑ์ / ขั้นต่ำ</th>
                    <th className="p-2 text-center">จำนวนที่พบ</th>
                    <th className="p-2 text-center">สถานะ</th>
                    <th className="p-2">เหตุผล / หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {selectedDetail.items?.map((it) => (
                    <tr key={it.id} className="hover:bg-slate-50">
                      <td className="p-2 text-center font-bold text-slate-400">{it.equipment_no}</td>
                      <td className="p-2 font-semibold text-slate-800">{it.equipment_name}</td>
                      <td className="p-2 text-center text-slate-500">{it.minimum_quantity} {it.unit}</td>
                      <td className="p-2 text-center font-bold text-slate-700">{it.available_quantity !== null ? it.available_quantity : '-'}</td>
                      <td className="p-2 text-center">
                        <StatusBadge status={it.status} size="sm" />
                      </td>
                      <td className="p-2 text-slate-600">
                        {it.reason && <div className="text-red-600 font-bold">{it.reason}</div>}
                        {it.note && <div className="text-[10px] text-slate-400">{it.note}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Action: Generate PDF */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-slate-400 text-[11px]">
                บันทึกเมื่อ: {formatThaiTime(selectedDetail.inspection?.completed_at)}
              </span>

              <button
                type="button"
                onClick={() => exportInspectionToPDF(selectedDetail.inspection, selectedDetail.items, selectedDetail.inspection?.vehicle)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>ดาวน์โหลดเอกสาร PDF</span>
              </button>
            </div>

          </div>
        )}
      </Modal>

    </div>
  );
}
