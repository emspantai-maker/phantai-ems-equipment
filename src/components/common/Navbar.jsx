import React from 'react';
import { LogOut, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LiveClock from './LiveClock';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-ems-navy text-white border-b border-ems-blue/50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          
          {/* Logo & Agency Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 p-1.5 flex items-center justify-center border border-white/20 shadow-inner">
              <img src="/icons/logo-ems.svg" alt="EMS Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm md:text-base font-bold tracking-tight text-white line-clamp-1">
                  หน่วยกู้ชีพเทศบาลเมืองพันท้ายนรสิงห์
                </h1>
                {isAdmin && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    <ShieldCheck className="w-3 h-3" />
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-[11px] md:text-xs text-blue-200/90 font-medium">
                ระบบตรวจสอบอุปกรณ์ประจำรถพยาบาล (Phantai EMS)
              </p>
            </div>
          </div>

          {/* Center/Right: Live Clock & User Info */}
          <div className="flex items-center gap-3 md:gap-5">
            {/* Live Clock (Hidden on very small screens, shown on md+) */}
            <div className="hidden lg:block">
              <LiveClock />
            </div>

            {/* User Profile Capsule */}
            {user && (
              <div className="flex items-center gap-2.5 bg-ems-blue/60 backdrop-blur px-3 py-1.5 rounded-xl border border-white/10 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-ems-primary flex items-center justify-center text-white font-bold text-xs shadow-inner">
                  {user.employee_code || user.name?.charAt(0) || <User className="w-4 h-4" />}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-white line-clamp-1">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-blue-200 flex items-center gap-1.5">
                    <span className="font-semibold text-amber-300">รหัส {user.employee_code}</span>
                    <span>•</span>
                    <span>{user.position}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={logout}
              title="ออกจากระบบ"
              className="p-2 rounded-xl text-blue-200 hover:text-white hover:bg-white/10 transition active:scale-95 border border-transparent hover:border-white/10"
            >
              <LogOut className="w-5 h-5 text-red-400 hover:text-red-300" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
