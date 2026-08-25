import React from 'react';
import { AlertCircle, XCircle, AlertTriangle } from 'lucide-react';
import Modal from '../common/Modal';

export default function MissingItemsAlert({ isOpen, onClose, missingItems = [], missingReasonItems = [] }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ไม่สามารถบันทึกผลการตรวจได้">
      <div className="space-y-4 text-left">
        
        {/* Warning Banner */}
        <div className="p-3.5 bg-red-50 rounded-2xl border border-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-red-900">
              ⚠️ กรุณาตรวจสอบอุปกรณ์ให้ครบทุก 40 รายการก่อนบันทึก
            </h4>
            <p className="text-xs text-red-700 mt-1 font-medium">
              ระบบไม่อนุญาตให้บันทึกผลหากมีอุปกรณ์ที่ยังไม่ได้ตรวจ หรือมีรายการชำรุดที่ยังไม่ได้ระบุเหตุผล
            </p>
          </div>
        </div>

        {/* Missing Unchecked Items List */}
        {missingItems.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <span>รายการที่ยังไม่ได้ตรวจ ({missingItems.length} รายการ):</span>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {missingItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-red-100 text-red-700 font-bold flex items-center justify-center text-[10px]">
                      {item.equipment_no?.toString().padStart(2, '0')}
                    </span>
                    <span className="font-semibold text-slate-800">
                      ❌ {item.equipment_name}
                    </span>
                  </div>
                  {item.reason && (
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                      {item.reason}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missing Reason Items List */}
        {missingReasonItems.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>รายการไม่พร้อมใช้งานที่ต้องระบุเหตุผล ({missingReasonItems.length} รายการ):</span>
            </div>
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
              {missingReasonItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-xl bg-amber-50 border border-amber-200 text-xs"
                >
                  <span className="w-6 h-6 rounded-lg bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-[10px]">
                    {item.equipment_no?.toString().padStart(2, '0')}
                  </span>
                  <span className="font-semibold text-amber-900">
                    ⚠️ {item.equipment_name} — กรุณาระบุสาเหตุ
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Button */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-ems-navy text-white text-sm font-bold shadow-md hover:bg-ems-blue transition active:scale-95 text-center"
          >
            กลับไปตรวจรายการที่เหลือ
          </button>
        </div>

      </div>
    </Modal>
  );
}
