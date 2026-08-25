import React from 'react';
import {
  LayoutDashboard,
  ClipboardCheck,
  History,
  BarChart3,
  AlertOctagon,
  User,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ currentPath, onNavigate }) {
  const { isAdmin } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'หน้าแรกภาพรวม', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'check', label: 'ตรวจอุปกรณ์ประจำรถ', icon: ClipboardCheck, path: '/check' },
    { id: 'history', label: 'ประวัติการตรวจสอบ', icon: History, path: '/history' },
    { id: 'statistics', label: 'สถิติและตารางรายเดือน', icon: BarChart3, path: '/statistics' },
    { id: 'abnormal', label: 'อุปกรณ์ไม่พร้อมใช้งาน', icon: AlertOctagon, path: '/abnormal' },
    { id: 'profile', label: 'ข้อมูลส่วนตัว', icon: User, path: '/profile' }
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'ผู้ดูแลระบบ (Admin)', icon: ShieldCheck, path: '/admin' });
  }

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 shadow-sm flex-shrink-0">
      
      {/* Quick Ambulances Header */}
      <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
          รถพยาบาลประจำการ (3 คัน)
        </span>
        <div className="grid grid-cols-3 gap-1.5 text-center">
          <span className="bg-white px-2 py-1 rounded-lg text-xs font-bold text-ems-navy border border-slate-200 shadow-2xs">กข9745</span>
          <span className="bg-white px-2 py-1 rounded-lg text-xs font-bold text-ems-navy border border-slate-200 shadow-2xs">กค7080</span>
          <span className="bg-white px-2 py-1 rounded-lg text-xs font-bold text-ems-navy border border-slate-200 shadow-2xs">กง3002</span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path || (item.path === '/dashboard' && currentPath === '/');

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.path)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                isActive
                  ? 'bg-ems-navy text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-auto pt-4 border-t border-slate-100 text-center">
        <div className="text-[11px] text-slate-400 font-medium">
          ระบบตรวจสอบอุปกรณ์ v1.0
        </div>
        <div className="text-[10px] text-slate-400">
          เทศบาลเมืองพันท้ายนรสิงห์
        </div>
      </div>

    </aside>
  );
}
