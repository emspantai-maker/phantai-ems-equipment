import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  Ambulance,
  FileSpreadsheet,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  PieChart as PieIcon
} from 'lucide-react';
import { getVehicles } from '../../services/vehicleService';
import { getInspections, getMonthlyMatrix } from '../../services/inspectionService';
import { exportMonthlyMatrixExcel } from '../../services/exportService';
import { getMonthYearOptions, THAI_MONTH_NAMES, toBuddhistYear } from '../../utils/dateUtils';
import { useToast } from '../../context/ToastContext';
import MonthlyMatrixTable from '../../components/reports/MonthlyMatrixTable';
import StatCard from '../../components/reports/StatCard';

export default function StatisticsPage() {
  const toast = useToast();
  const monthOptions = getMonthYearOptions();

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [matrixData, setMatrixData] = useState(null);
  const [monthInspections, setMonthInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVehicles() {
      try {
        const vList = await getVehicles();
        setVehicles(vList);
        if (vList.length > 0) {
          setSelectedVehicleId(vList[0].id);
        }
      } catch (err) {
        console.error('Error loading vehicles:', err);
      }
    }
    loadVehicles();
  }, []);

  useEffect(() => {
    async function loadStats() {
      if (!selectedVehicleId) return;
      setLoading(true);
      try {
        const matrix = await getMonthlyMatrix(selectedVehicleId, selectedYear, selectedMonth);
        setMatrixData(matrix);

        const insps = await getInspections({
          year: selectedYear,
          month: selectedMonth
        });
        setMonthInspections(insps);
      } catch (err) {
        console.error('Error loading stats:', err);
        toast.error('ไม่สามารถโหลดข้อมูลสถิติได้');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [selectedVehicleId, selectedYear, selectedMonth]);

  const handleMonthChange = (e) => {
    const [y, m] = e.target.value.split('-');
    setSelectedYear(parseInt(y, 10));
    setSelectedMonth(parseInt(m, 10));
  };

  const handleExportMonthlyExcel = async () => {
    try {
      toast.info('กำลังส่งออกรายงาน Excel...');
      await exportMonthlyMatrixExcel(vehicles, selectedYear, selectedMonth);
      toast.success('ส่งออกตารางรายงานรายเดือน 3 รถ สำเร็จ');
    } catch (err) {
      toast.error('ส่งออก Excel ไม่สำเร็จ');
    }
  };

  const currentVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  // Stats calculation
  const totalInspectionsInMonth = monthInspections.length;
  const completedWithoutIssue = monthInspections.filter(i => i.overall_status === 'COMPLETED').length;
  const withIssues = monthInspections.filter(i => i.overall_status === 'HAS_ISSUES').length;
  const totalPossibleShifts = vehicles.length * (matrixData?.daysInMonth || 30) * 2;
  const complianceRate = totalPossibleShifts > 0 ? Math.round((totalInspectionsInMonth / totalPossibleShifts) * 100) : 0;

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-ems-primary" />
            <span>สถิติ & ตารางการตรวจสอบรายเดือน 31 วัน</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            สรุปข้อมูลการตรวจเช็คแยกตามรถพยาบาล 3 คัน (กข9745, กค7080, กง3002)
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportMonthlyExcel}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition active:scale-95 flex items-center gap-2 self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>ส่งออกตาราง Excel รายเดือน 3 รถ</span>
        </button>
      </div>

      {/* Month & Vehicle Selection Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-soft">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* Month Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-ems-primary" />
              <span>เลือกเดือนและปี พ.ศ.</span>
            </label>
            <select
              value={`${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`}
              onChange={handleMonthChange}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 focus:bg-white"
            >
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Vehicle Selector Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Ambulance className="w-4 h-4 text-ems-primary" />
              <span>เลือกรถพยาบาล</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              {vehicles.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVehicleId(v.id)}
                  className={`py-2 px-1 rounded-lg text-xs font-extrabold transition-all truncate ${
                    selectedVehicleId === v.id
                      ? 'bg-ems-navy text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {v.license_plate}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          title="การตรวจทั้งหมดในเดือนนี้"
          value={`${totalInspectionsInMonth} เวร`}
          subtitle={`ความครอบคลุม ${complianceRate}%`}
          icon={Clock}
          color="blue"
        />

        <StatCard
          title="ผ่านการตรวจสมบูรณ์"
          value={`${completedWithoutIssue} เวร`}
          subtitle="ไม่มีรายการชำรุด"
          icon={CheckCircle2}
          color="emerald"
        />

        <StatCard
          title="พบข้อบกพร่อง"
          value={`${withIssues} เวร`}
          subtitle="มีอุปกรณ์ไม่พร้อมใช้"
          icon={AlertTriangle}
          color={withIssues > 0 ? 'red' : 'slate'}
        />

        <StatCard
          title="อัตราความพร้อมใช้งาน"
          value={totalInspectionsInMonth > 0 ? `${Math.round((completedWithoutIssue / totalInspectionsInMonth) * 100)}%` : '0%'}
          subtitle="เฉลี่ยทั้งหน่วย"
          icon={TrendingUp}
          color="amber"
        />
      </div>

      {/* 31-Day Monthly Matrix Table (Requirement #49, 76, 77, 78) */}
      <MonthlyMatrixTable
        vehicle={currentVehicle}
        year={selectedYear}
        month={selectedMonth}
        matrixData={matrixData}
      />

    </div>
  );
}
