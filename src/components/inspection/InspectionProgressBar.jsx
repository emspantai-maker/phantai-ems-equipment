import React from 'react';
import { CheckCircle2, XCircle, CircleDashed } from 'lucide-react';

export default function InspectionProgressBar({ items = [] }) {
  const total = items.length || 40;
  const readyCount = items.filter(i => i.status === 'READY').length;
  const notReadyCount = items.filter(i => i.status === 'NOT_READY').length;
  const checkedCount = readyCount + notReadyCount;
  const uncheckedCount = total - checkedCount;

  const percentage = Math.round((checkedCount / total) * 100) || 0;
  const isComplete = checkedCount === total && total > 0;

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft mb-6">
      
      {/* Progress Counter Row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-800">
            ความคืบหน้าการตรวจ:
          </span>
          <span className={`text-base font-extrabold px-2.5 py-0.5 rounded-lg border ${
            isComplete
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-blue-50 text-ems-navy border-blue-200'
          }`}>
            {isComplete ? `ตรวจครบ ${checkedCount} / ${total} รายการ` : `ตรวจแล้ว ${checkedCount} / ${total} รายการ`}
          </span>
        </div>

        <span className="text-sm font-black text-ems-navy tabular-nums">
          {percentage}%
        </span>
      </div>

      {/* Progress Bar Track */}
      <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/80">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isComplete
              ? 'bg-emerald-500 shadow-sm'
              : percentage > 50
              ? 'bg-ems-primary'
              : 'bg-amber-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Stats Counter Pills */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-1.5 bg-emerald-50/70 border border-emerald-200 px-2.5 py-1.5 rounded-xl text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <div>
            <span className="text-[10px] text-emerald-600 block">พร้อมใช้</span>
            <span className="font-bold text-sm">{readyCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-red-50/70 border border-red-200 px-2.5 py-1.5 rounded-xl text-red-800">
          <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <div>
            <span className="text-[10px] text-red-600 block">ไม่พร้อมใช้</span>
            <span className="font-bold text-sm">{notReadyCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-slate-700">
          <CircleDashed className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <div>
            <span className="text-[10px] text-slate-500 block">ยังไม่ได้ตรวจ</span>
            <span className={`font-bold text-sm ${uncheckedCount > 0 ? 'text-red-600 font-extrabold' : 'text-slate-600'}`}>
              {uncheckedCount}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
