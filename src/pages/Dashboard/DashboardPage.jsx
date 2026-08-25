import React, { useState, useEffect } from 'react';
import {
  Ambulance,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ClipboardCheck,
  History,
  TrendingUp,
  PlusCircle,
  Sun,
  Moon,
  ChevronRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getVehicles } from '../../services/vehicleService';
import { getInspections, getMissingInspections, getAbnormalItems } from '../../services/inspectionService';
import { formatThaiDate, getFormattedLiveDateTime } from '../../utils/dateUtils';
import LiveClock from '../../components/common/LiveClock';
import StatCard from '../../components/reports/StatCard';
import StatusBadge from '../../components/common/StatusBadge';

export default function DashboardPage({ onNavigate, onStartInspectionWithVehicle }) {
  const { user, isAdmin } = useAuth();
  const todayLive = getFormattedLiveDateTime();

  const [vehicles, setVehicles] = useState([]);
  const [todayInspections, setTodayInspections] = useState([]);
  const [missingInspections, setMissingInspections] = useState([]);
  const [abnormalItems, setAbnormalItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const vehList = await getVehicles();
      setVehicles(vehList);

      const insps = await getInspections({ date: todayLive.isoDate });
      setTodayInspections(insps);

      const missing = await getMissingInspections(todayLive.isoDate);
      setMissingInspections(missing);

      const abnormals = await getAbnormalItems();
      setAbnormalItems(abnormals);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Summary counts for today
  const totalShiftsToday = vehicles.length * 2;
  const completedShiftsToday = todayInspections.length;
  const totalReadyToday = todayInspections.reduce((acc, i) => acc + (i.ready_items || 0), 0);
  const totalNotReadyToday = todayInspections.reduce((acc, i) => acc + (i.not_ready_items || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Welcome & Live Bangkok Clock Banner */}
      <div className="bg-gradient-to-r from-ems-navy via-ems-blue to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-card flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              หน่วยกู้ชีพเทศบาลเมืองพันท้ายนรสิงห์
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            สวัสดี, {user?.name}
          </h2>
          <p className="text-xs sm:text-sm text-blue-200 mt-1 flex items-center gap-2">
            <span>รหัสเจ้าหน้าที่: <strong className="text-amber-300">{user?.employee_code}</strong></span>
            <span>•</span>
            <span>ตำแหน่ง: {user?.position}</span>
          </p>
        </div>

        {/* Live Clock on Dashboard */}
        <div className="flex flex-col items-start md:items-end gap-2">
          <LiveClock showDate={true} />
          <button
            onClick={() => onNavigate('/check')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-ems-red hover:bg-ems-redDark text-white text-sm font-extrabold shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>เริ่มตรวจอุปกรณ์ประจำรถ</span>
          </button>
        </div>
      </div>

      {/* Missing Inspections Alert Banner (Automated Detection) */}
      {missingInspections.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600 animate-pulse" />
              <span>รายการตรวจที่ยังค้างอยู่ในวันนี้ ({missingInspections.length} เวร):</span>
            </div>
            <span className="text-[11px] text-amber-700 font-semibold bg-amber-100 px-2 py-0.5 rounded-md">
              จำเป็นต้องตรวจ
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
            {missingInspections.map((m, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-amber-200/80 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <span className="font-bold text-slate-800">{m.vehicle.license_plate}</span>
                  <span className="text-slate-500 font-medium">({m.shiftLabel})</span>
                </div>
                <button
                  type="button"
                  onClick={() => onStartInspectionWithVehicle?.(m.vehicle, m.shift)}
                  className="px-2.5 py-1 bg-ems-navy text-white text-[11px] font-bold rounded-lg hover:bg-ems-blue active:scale-95 transition"
                >
                  ตรวจตอนนี้
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overall KPI Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="รถพยาบาลประจำการ"
          value={`${vehicles.length} คัน`}
          subtitle="กข9745, กค7080, กง3002"
          icon={Ambulance}
          color="blue"
        />

        <StatCard
          title="ตรวจแล้ววันนี้"
          value={`${completedShiftsToday} / ${totalShiftsToday}`}
          subtitle={completedShiftsToday === totalShiftsToday ? 'ตรวจครบทุกเวร' : `ยังขาดอีก ${totalShiftsToday - completedShiftsToday} เวร`}
          icon={Clock}
          color={completedShiftsToday === totalShiftsToday ? 'emerald' : 'amber'}
        />

        <StatCard
          title="อุปกรณ์พร้อมใช้งาน"
          value={totalReadyToday}
          subtitle="จากการตรวจวันนี้"
          icon={CheckCircle2}
          color="emerald"
        />

        <StatCard
          title="พบข้อบกพร่อง/ชำรุด"
          value={totalNotReadyToday}
          subtitle="ต้องตรวจสอบ/แก้ไข"
          icon={XCircle}
          color={totalNotReadyToday > 0 ? 'red' : 'slate'}
          onClick={() => onNavigate('/abnormal')}
        />
      </div>

      {/* Ambulance Inspection Cards (3 Master Vehicles) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Ambulance className="w-5 h-5 text-ems-primary" />
              <span>สถานะการตรวจรถพยาบาลประจำวันนี้ ({formatThaiDate(todayLive.isoDate)})</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              รถแต่ละคันต้องมีการตรวจ 2 ครั้งต่อวัน (เวรเช้า 08:00 และ เวรดึก 20:00)
            </p>
          </div>

          <button
            onClick={loadDashboardData}
            title="รีเฟรชข้อมูล"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {vehicles.map((vehicle) => {
            const morningInsp = todayInspections.find(
              i => (i.vehicle_id === vehicle.id || i.vehicle?.license_plate === vehicle.license_plate) && i.shift === 'MORNING'
            );
            const nightInsp = todayInspections.find(
              i => (i.vehicle_id === vehicle.id || i.vehicle?.license_plate === vehicle.license_plate) && i.shift === 'NIGHT'
            );

            return (
              <div
                key={vehicle.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-soft hover:shadow-card transition-all flex flex-col justify-between"
              >
                {/* Vehicle Header */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {vehicle.vehicle_code}
                      </span>
                      <h4 className="text-xl font-black text-ems-navy">
                        {vehicle.license_plate}
                      </h4>
                      <p className="text-xs text-slate-600 font-medium">
                        {vehicle.vehicle_name}
                      </p>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-ems-navy flex items-center justify-center font-bold text-sm shadow-inner border border-blue-100">
                      🚑
                    </div>
                  </div>

                  {/* Morning & Night Shift Status Rows */}
                  <div className="space-y-2.5 my-4 pt-2 border-t border-slate-100">
                    
                    {/* MORNING SHIFT */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-lg bg-amber-100 text-amber-700">
                          <Sun className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">เวรเช้า (08:00)</span>
                          {morningInsp && (
                            <span className="text-[10px] text-slate-500 font-medium">
                              ผู้ตรวจ: รหัส {morningInsp.inspector_code}
                            </span>
                          )}
                        </div>
                      </div>

                      {morningInsp ? (
                        <StatusBadge status={morningInsp.overall_status === 'COMPLETED' ? 'READY' : 'NOT_READY'} size="sm" />
                      ) : (
                        <StatusBadge status="NOT_CHECKED" size="sm" />
                      )}
                    </div>

                    {/* NIGHT SHIFT */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-lg bg-indigo-100 text-indigo-700">
                          <Moon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">เวรดึก (20:00)</span>
                          {nightInsp && (
                            <span className="text-[10px] text-slate-500 font-medium">
                              ผู้ตรวจ: รหัส {nightInsp.inspector_code}
                            </span>
                          )}
                        </div>
                      </div>

                      {nightInsp ? (
                        <StatusBadge status={nightInsp.overall_status === 'COMPLETED' ? 'READY' : 'NOT_READY'} size="sm" />
                      ) : (
                        <StatusBadge status="NOT_CHECKED" size="sm" />
                      )}
                    </div>

                  </div>
                </div>

                {/* Card Action Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onStartInspectionWithVehicle?.(vehicle)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-ems-navy hover:bg-ems-blue transition active:scale-95 shadow flex items-center justify-center gap-1.5"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    <span>ตรวจอุปกรณ์รถ {vehicle.license_plate}</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <div
          onClick={() => onNavigate('/history')}
          className="p-4 bg-white rounded-2xl border border-slate-200 shadow-soft hover:shadow-card cursor-pointer transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-50 text-ems-primary">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-slate-800">ประวัติการตรวจสอบ</h5>
              <p className="text-[11px] text-slate-500">ดูรายการตรวจย้อนหลัง & Export PDF/Excel</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </div>

        <div
          onClick={() => onNavigate('/statistics')}
          className="p-4 bg-white rounded-2xl border border-slate-200 shadow-soft hover:shadow-card cursor-pointer transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-slate-800">สถิติ & ตารางรายเดือน 31 วัน</h5>
              <p className="text-[11px] text-slate-500">ตาราง Matrix รายรถ และ กราฟวิเคราะห์</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </div>

        <div
          onClick={() => onNavigate('/abnormal')}
          className="p-4 bg-white rounded-2xl border border-slate-200 shadow-soft hover:shadow-card cursor-pointer transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-red-50 text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-slate-800">อุปกรณ์ไม่พร้อมใช้งาน</h5>
              <p className="text-[11px] text-slate-500">{abnormalItems.length} รายการที่ต้องแก้ไข</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </div>
      </div>

    </div>
  );
}
