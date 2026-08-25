import React from 'react';
import {
  LayoutDashboard,
  ClipboardCheck,
  History,
  BarChart3,
  AlertOctagon,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function BottomNav({ currentPath, onNavigate }) {
  const { isAdmin } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'หน้าแรก', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'check', label: 'ตรวจอุปกรณ์', icon: ClipboardCheck, path: '/check' },
    { id: 'history', label: 'ประวัติ', icon: History, path: '/history' },
    { id: 'statistics', label: 'สถิติ', icon: BarChart3, path: '/statistics' },
    { id: 'abnormal', label: 'ผิดปกติ', icon: AlertOctagon, path: '/abnormal' }
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'Admin', icon: ShieldCheck, path: '/admin' });
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-floating px-2 py-1">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path || (item.path === '/dashboard' && currentPath === '/');

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.path)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-ems-navy font-bold'
                  : 'text-slate-500 font-medium hover:text-slate-900'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-ems-light text-ems-navy scale-110 shadow-sm' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-ems-navy' : 'text-slate-400'}`} />
              </div>
              <span className={`text-[10px] mt-0.5 ${isActive ? 'text-ems-navy font-bold' : 'text-slate-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
