import React, { useState, useEffect } from 'react';
import { AlertOctagon, Ambulance, Calendar, User, Search, RefreshCw } from 'lucide-react';
import { getAbnormalItems } from '../../services/inspectionService';
import { getVehicles } from '../../services/vehicleService';
import { formatThaiDate, formatThaiTime } from '../../utils/dateUtils';
import { useToast } from '../../context/ToastContext';

export default function AbnormalItemsPage() {
  const toast = useToast();
  const [abnormalList, setAbnormalList] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedPlate, setSelectedPlate] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const vList = await getVehicles();
      setVehicles(vList);

      const items = await getAbnormalItems();
      setAbnormalList(items);
    } catch (err) {
      console.error('Error loading abnormal items:', err);
      toast.error('ไม่สามารถโหลดรายการผิดปกติได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = abnormalList.filter((item) => {
    const matchSearch =
      !search ||
      item.equipment_name.toLowerCase().includes(search.toLowerCase()) ||
      item.reason?.toLowerCase().includes(search.toLowerCase()) ||
      item.inspector_name?.toLowerCase().includes(search.toLowerCase()) ||
      item.vehicle_plate?.toLowerCase().includes(search.toLowerCase());

    const matchVehicle = !selectedPlate || item.vehicle_plate === selectedPlate;

    return matchSearch && matchVehicle;
  });

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <AlertOctagon className="w-6 h-6 text-red-600" />
            <span>รายการอุปกรณ์ที่ไม่พร้อมใช้งาน / ข้อบกพร่อง</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            ระบบติดตามอุปกรณ์ที่ชำรุด สูญหาย หรือไม่ผ่านเกณฑ์ เพื่อการแก้ไขและเบิกจ่ายเร่งด่วน
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-soft grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาตามชื่ออุปกรณ์, สาเหตุ, หรือ รหัสผู้ตรวจ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-ems-primary"
          />
        </div>

        <select
          value={selectedPlate}
          onChange={(e) => setSelectedPlate(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white"
        >
          <option value="">-- รถพยาบาลทุกคัน --</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.license_plate}>{v.license_plate} ({v.vehicle_name})</option>
          ))}
        </select>
      </div>

      {/* Abnormal Items Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            กำลังโหลดรายการอุปกรณ์ที่ไม่พร้อมใช้งาน...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              ✓
            </div>
            <h4 className="text-base font-bold text-slate-700">ไม่พบรายการอุปกรณ์ที่ไม่พร้อมใช้งาน</h4>
            <p className="text-xs text-slate-400">อุปกรณ์ประจำรถทุกคันอยู่ในเกณฑ์พร้อมใช้งานสมบูรณ์</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-red-50/80 border-b border-red-200 text-red-900 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">รถพยาบาล</th>
                  <th className="py-3 px-4">วันที่ / เวร</th>
                  <th className="py-3 px-4">รายการอุปกรณ์</th>
                  <th className="py-3 px-4 text-center">เกณฑ์ขั้นต่ำ</th>
                  <th className="py-3 px-4 text-center">จำนวนที่พบ</th>
                  <th className="py-3 px-4">สาเหตุที่ไม่พร้อมใช้งาน</th>
                  <th className="py-3 px-4">ผู้ตรวจ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-red-50/30 transition-colors">
                    
                    {/* Vehicle */}
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-ems-navy bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {item.vehicle_plate}
                      </span>
                    </td>

                    {/* Date & Shift */}
                    <td className="py-3 px-4 font-bold text-slate-800">
                      <div>{formatThaiDate(item.inspection_date)}</div>
                      <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] ${
                        item.shift === 'MORNING' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {item.shift === 'MORNING' ? 'เวรเช้า' : 'เวรดึก'}
                      </span>
                    </td>

                    {/* Equipment Name */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">
                        {item.equipment_no}. {item.equipment_name}
                      </span>
                    </td>

                    {/* Minimum Qty */}
                    <td className="py-3 px-4 text-center text-slate-500">
                      {item.minimum_quantity} {item.unit || ''}
                    </td>

                    {/* Found Qty */}
                    <td className="py-3 px-4 text-center font-extrabold text-red-600">
                      {item.available_quantity !== null ? `${item.available_quantity} ${item.unit || ''}` : '-'}
                    </td>

                    {/* Reason */}
                    <td className="py-3 px-4">
                      <span className="text-red-700 font-bold bg-red-50 px-2 py-1 rounded-lg border border-red-200 inline-block">
                        {item.reason || '-'}
                      </span>
                      {item.note && (
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          หมายเหตุ: {item.note}
                        </span>
                      )}
                    </td>

                    {/* Inspector */}
                    <td className="py-3 px-4 text-slate-700">
                      <div className="font-bold">{item.inspector_name}</div>
                      <div className="text-[10px] text-slate-400">
                        รหัส {item.inspector_code} ({formatThaiTime(item.checked_at)})
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
