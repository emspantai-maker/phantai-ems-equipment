import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, X } from 'lucide-react';
import Modal from '../common/Modal';

export default function BulkReadyModal({ isOpen, onClose, onConfirm }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ยืนยันการตั้งค่ารายการทั่วไป">
      <div className="space-y-4">
        
        {/* Alert Icon & Heading */}
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-left">
            <h4 className="text-sm font-bold text-amber-900 mb-1">
              ⚠️ คำเตือนสำคัญตามระเบียบการตรวจกู้ชีพ
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              การดำเนินการนี้จะตั้งค่าเฉพาะ <strong>“รายการทั่วไป”</strong> เป็น “พร้อมใช้งาน”
              สำหรับรายการที่ต้องตรวจด้วยตนเองและรายการที่ต้องกรอกค่าจริงจะยังคงเป็น <strong>“ยังไม่ได้ตรวจ”</strong>
            </p>
          </div>
        </div>

        {/* Excluded List Info Box */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-left">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <span>รายการที่จะไม่ถูกเปลี่ยนสถานะ (ผู้ตรวจต้องตรวจและกรอกเอง):</span>
          </div>
          <ul className="text-xs text-slate-600 space-y-1 pl-5 list-disc font-medium">
            <li><strong>น้ำกลั่น</strong> (ลำดับ 5) — ตรวจทุกวัน ห้าม Auto Ready</li>
            <li><strong>น้ำมันเชื้อเพลิง</strong> (ลำดับ 6) — ต้องตรวจระดับน้ำมันจริง</li>
            <li><strong>ออกซิเจน No.1, No.2, No.3</strong> (ลำดับ 36-38) — ต้องกรอกค่า psi จริง</li>
            <li><strong>รายการที่มีเกณฑ์จำนวนขั้นต่ำ</strong> (Hard Collar, ไม้ดาม, DTX, หน้ากาก, บูธ ฯลฯ)</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-100 transition active:scale-95"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-ems-navy text-white text-sm font-bold shadow-md hover:bg-ems-blue transition active:scale-95 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>ดำเนินการต่อ</span>
          </button>
        </div>

      </div>
    </Modal>
  );
}
