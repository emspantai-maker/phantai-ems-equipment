import React from 'react';
import { CheckCircle2, XCircle, Ambulance, Calendar, User, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import Modal from '../common/Modal';
import { formatThaiDate } from '../../utils/dateUtils';

export default function InspectionSummaryModal({
  isOpen,
  onClose,
  onConfirm,
  vehicle,
  inspectionDate,
  shift,
  inspector,
  summary,
  isSubmitting = false
}) {
  const shiftText = shift === 'MORNING' ? 'เวรเช้า (08:00 - 20:00 น.)' : 'เวรดึก (20:00 - 08:00 น.)';

  return (
    <Modal isOpen={isOpen} onClose={isSubmitting ? undefined : onClose} title="สรุปผลการตรวจอุปกรณ์ก่อนบันทึก">
      <div className="space-y-4 text-left">
        
        {/* Info Grid */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <Ambulance className="w-4 h-4 text-ems-primary" />
              รถพยาบาล:
            </span>
            <span className="text-sm font-extrabold text-ems-navy bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
              {vehicle?.license_plate} ({vehicle?.vehicle_name})
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-ems-primary" />
              วันที่ตรวจ:
            </span>
            <span className="text-sm font-bold text-slate-800">
              {formatThaiDate(inspectionDate)}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-ems-primary" />
              รอบการตรวจ:
            </span>
            <span className="text-sm font-bold text-slate-800">
              {shiftText}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <User className="w-4 h-4 text-ems-primary" />
              ผู้ตรวจ:
            </span>
            <span className="text-sm font-bold text-slate-800">
              {inspector?.name} (รหัส {inspector?.employee_code})
            </span>
          </div>

        </div>

        {/* Counter Summary Cards */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
            <span className="text-[11px] text-slate-500 block font-medium">อุปกรณ์ทั้งหมด</span>
            <span className="text-lg font-black text-slate-800">{summary?.total || 40}</span>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-[11px] text-emerald-700 block font-bold flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> พร้อมใช้
            </span>
            <span className="text-lg font-black text-emerald-700">{summary?.readyCount || 0}</span>
          </div>

          <div className="p-3 bg-red-50 rounded-xl border border-red-200">
            <span className="text-[11px] text-red-700 block font-bold flex items-center justify-center gap-1">
              <XCircle className="w-3 h-3 text-red-600" /> ไม่พร้อมใช้
            </span>
            <span className="text-lg font-black text-red-700">{summary?.notReadyCount || 0}</span>
          </div>
        </div>

        {summary?.notReadyCount > 0 && (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>มีอุปกรณ์ที่ไม่พร้อมใช้งาน {summary.notReadyCount} รายการ ระบบจะบันทึกพร้อมแจ้งเตือนในระบบติดตามข้อบกพร่อง</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-100 transition disabled:opacity-50"
          >
            แก้ไขข้อมูล
          </button>
          
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onConfirm}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold shadow-md transition active:scale-95 flex items-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>กำลังบันทึกข้อมูล...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>บันทึกผลการตรวจ</span>
              </>
            )}
          </button>
        </div>

      </div>
    </Modal>
  );
}
