import React, { useState } from 'react';
import { Ambulance, Lock, User, LogIn, AlertCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import LiveClock from '../../components/common/LiveClock';

export default function LoginPage({ onNavigate }) {
  const { login } = useAuth();
  const toast = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMessage('กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      await login(username, password);
      toast.success('เข้าสู่ระบบสำเร็จ ยินดีต้อนรับสู่ระบบตรวจอุปกรณ์');
    } catch (err) {
      setErrorMessage(err.message || 'ไม่สามารถเข้าสู่ระบบได้ กรุณาตรวจสอบข้อมูล');
      toast.error(err.message || 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (u, p) => {
    setUsername(u);
    setPassword(p);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ems-navy via-ems-dark to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 text-white">
      
      {/* Top Realtime Clock */}
      <div className="flex justify-center mb-6">
        <LiveClock />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Emblem Logo */}
        <div className="mx-auto w-20 h-20 bg-white/10 p-2.5 rounded-3xl backdrop-blur border border-white/20 shadow-2xl flex items-center justify-center mb-4">
          <img src="/icons/logo-ems.svg" alt="Phantai EMS" className="w-full h-full object-contain" />
        </div>

        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
          ระบบตรวจสอบอุปกรณ์ประจำรถพยาบาล
        </h2>
        <p className="mt-1 text-sm font-semibold text-blue-300">
          หน่วยกู้ชีพเทศบาลเมืองพันท้ายนรสิงห์
        </p>
      </div>

      {/* Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white text-slate-900 py-8 px-6 sm:px-10 rounded-3xl shadow-card border border-white/20">
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {errorMessage && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ชื่อผู้ใช้งาน หรือ รหัสพนักงาน <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="เช่น phantai312 หรือ 312"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-ems-primary focus:border-ems-primary"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                รหัสผ่าน <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="กรอกรหัสผ่าน"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-ems-primary focus:border-ems-primary"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-extrabold text-white bg-ems-navy hover:bg-ems-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ems-primary shadow-md transition-all active:scale-98 disabled:opacity-60"
            >
              {loading ? (
                <span>กำลังเข้าสู่ระบบ...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>เข้าสู่ระบบ</span>
                </>
              )}
            </button>

            {/* Register Link */}
            <div className="pt-2 text-center text-xs text-slate-500 flex items-center justify-center gap-1">
              <span>ยังไม่มีบัญชีผู้ใช้งาน?</span>
              <button
                type="button"
                onClick={() => onNavigate('/register')}
                className="font-bold text-ems-primary hover:text-ems-navy underline"
              >
                สมัครสมาชิกใหม่
              </button>
            </div>

          </form>

          {/* Quick Demo Logins Selection Accordion / Helper */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
              บัญชีทดสอบเริ่มต้น (ตามข้อกำหนดระบบ)
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => setDemoAccount('phantai312', 'ems123456')}
                className="p-1.5 rounded-lg bg-blue-50 text-ems-navy hover:bg-blue-100 text-left border border-blue-200/60 font-semibold"
              >
                🚑 EMT 312 (สมชาย)
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('phantai122', 'ems123456')}
                className="p-1.5 rounded-lg bg-blue-50 text-ems-navy hover:bg-blue-100 text-left border border-blue-200/60 font-semibold"
              >
                🚑 EMR 122 (วรวุฒิ)
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('phantai325', 'ems123456')}
                className="p-1.5 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 text-left border border-slate-200 font-semibold"
              >
                🚑 EMT 325 (ธีรภัทร)
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('ems.pantai@gmail.com', 'ems1669')}
                className="p-1.5 rounded-lg bg-amber-50 text-amber-900 hover:bg-amber-100 text-left border border-amber-200 font-bold"
              >
                ⚙️ Admin (ผู้ดูแลระบบ)
              </button>
            </div>
          </div>

        </div>
      </div>

      <footer className="mt-8 text-center text-xs text-blue-200/60">
        หน่วยกู้ชีพเทศบาลเมืองพันท้ายนรสิงห์ • พ.ศ. 2569
      </footer>
    </div>
  );
}
