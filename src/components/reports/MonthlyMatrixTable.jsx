import React from 'react';
import { Check, AlertTriangle, Minus, User } from 'lucide-react';
import { THAI_MONTH_NAMES, toBuddhistYear } from '../../utils/dateUtils';

export default function MonthlyMatrixTable({
  vehicle,
  year,
  month,
  matrixData,
  onViewInspection
}) {
  const monthName = THAI_MONTH_NAMES[month - 1];
  const thaiYear = toBuddhistYear(year);

  // Extract unique inspectors who conducted checks in this month
  const inspectorsMap = new Map();
  matrixData?.days?.forEach(d => {
    if (d.morning && d.morning.inspector_code) {
      inspectorsMap.set(d.morning.inspector_code, d.morning.inspector_name);
    }
    if (d.night && d.night.inspector_code) {
      inspectorsMap.set(d.night.inspector_code, d.night.inspector_name);
    }
  });
  const inspectorsList = Array.from(inspectorsMap.entries()).map(([code, name]) => ({ code, name }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
      
      {/* Table Header Banner */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold text-ems-navy">
              รถพยาบาล: {vehicle?.license_plate} ({vehicle?.vehicle_name})
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            ประจำเดือน {monthName} พ.ศ. {thaiYear}
          </p>
        </div>

        <div className="text-xs text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs font-semibold">
          ตรวจแล้ว: <span className="text-emerald-600 font-bold">{matrixData?.checkedShifts || 0}</span> / {matrixData?.totalShifts || 0} เวร
        </div>
      </div>

      {/* Responsive Matrix Grid */}
      <div className="overflow-x-auto max-h-[500px]">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="bg-ems-navy text-white sticky top-0 z-10 text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-3 border border-ems-blue/60 text-center w-12 font-bold">วันที่</th>
              <th className="py-2.5 px-3 border border-ems-blue/60 text-center font-bold" colSpan={3}>
                เวรเช้า (08:00 - 20:00 น.)
              </th>
              <th className="py-2.5 px-3 border border-ems-blue/60 text-center font-bold" colSpan={3}>
                เวรดึก (20:00 - 08:00 น.)
              </th>
            </tr>
            <tr className="bg-ems-blue text-blue-100 text-[10px]">
              <th className="py-1.5 px-2 border border-ems-blue/60 text-center">วัน</th>
              <th className="py-1.5 px-2 border border-ems-blue/60 text-center w-16">สถานะ</th>
              <th className="py-1.5 px-2 border border-ems-blue/60 text-center w-24">รหัสผู้ตรวจ</th>
              <th className="py-1.5 px-2 border border-ems-blue/60 text-center w-20">เวลา</th>
              <th className="py-1.5 px-2 border border-ems-blue/60 text-center w-16">สถานะ</th>
              <th className="py-1.5 px-2 border border-ems-blue/60 text-center w-24">รหัสผู้ตรวจ</th>
              <th className="py-1.5 px-2 border border-ems-blue/60 text-center w-20">เวลา</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {matrixData?.days?.map((d) => (
              <tr key={d.day} className="hover:bg-slate-50/80 transition-colors">
                
                {/* Day Number */}
                <td className="py-2 px-3 text-center font-bold text-slate-800 bg-slate-50/50 border-r border-slate-200">
                  {d.day}
                </td>

                {/* MORNING SHIFT */}
                <td className="py-2 px-2 text-center border-r border-slate-100">
                  {d.morning ? (
                    <button
                      type="button"
                      onClick={() => onViewInspection?.(d.morning.inspection_id)}
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold transition hover:scale-110 shadow-2xs ${
                        d.morning.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                      title={d.morning.status === 'COMPLETED' ? 'ผ่านการตรวจครบถ้วน' : 'พบรายการผิดปกติ'}
                    >
                      {d.morning.status === 'COMPLETED' ? <Check className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    </button>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </td>
                <td className="py-2 px-2 text-center text-slate-700 border-r border-slate-100 font-semibold">
                  {d.morning ? d.morning.inspector_code : '-'}
                </td>
                <td className="py-2 px-2 text-center text-slate-500 border-r border-slate-200">
                  {d.morning ? d.morning.time : '-'}
                </td>

                {/* NIGHT SHIFT */}
                <td className="py-2 px-2 text-center border-r border-slate-100">
                  {d.night ? (
                    <button
                      type="button"
                      onClick={() => onViewInspection?.(d.night.inspection_id)}
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold transition hover:scale-110 shadow-2xs ${
                        d.night.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                      title={d.night.status === 'COMPLETED' ? 'ผ่านการตรวจครบถ้วน' : 'พบรายการผิดปกติ'}
                    >
                      {d.night.status === 'COMPLETED' ? <Check className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    </button>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </td>
                <td className="py-2 px-2 text-center text-slate-700 border-r border-slate-100 font-semibold">
                  {d.night ? d.night.inspector_code : '-'}
                </td>
                <td className="py-2 px-2 text-center text-slate-500">
                  {d.night ? d.night.time : '-'}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dynamic Inspector Signatures at Bottom of Table */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs">
        <div className="flex items-center gap-1.5 text-slate-700 font-bold mb-2">
          <User className="w-4 h-4 text-ems-primary" />
          <span>รายนามผู้ปฏิบัติการตรวจเช็คในรอบเดือนนี้ ({inspectorsList.length} ท่าน):</span>
        </div>
        {inspectorsList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {inspectorsList.map(({ code, name }) => (
              <div key={code} className="bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-800">รหัส {code}</span>
                <span className="text-slate-600 truncate ml-2">{name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 italic">ยังไม่มีการบันทึกการตรวจในเดือนนี้</p>
        )}
      </div>

    </div>
  );
}
