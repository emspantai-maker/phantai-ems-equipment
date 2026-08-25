import React, { useState } from 'react';
import { KeyRound, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function FirstLoginPage() {
  const { user, updateFirstLoginPassword, logout } = useAuth();
  const toast = useToast();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setErrorMessage('กรุณากรอกรหัสผ่านใหม่และยืนยันรหัสผ่าน');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    if (newPassword === 'ems123456') {
      setErrorMessage('ห้ามใช้รหัสผ่านเริ่มต้นเริ่มต้น กรุณาตั้งรหัสผ่านใหม่ที่มีความปลอดภัย');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      await updateFirstLoginPassword(newPassword);
      toast.success('เปลี่ยนรหัสผ่านครั้งแรกสำเร็จ ยินดีต้อนรับเข้าสู่ระบบ');
    } catch (err) {
      setErrorMessage(err.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้');
      toast.error('เปลี่ยนรหัสผ่านไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-16 h-16 bg-amber-500/20 text-amber-400 border border-amber-500/30 p-3 rounded-2xl flex items-center justify-center mb-3">
          <KeyRound className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white">
          กรุณาเปลี่ยนรหัสผ่านสำหรับการเข้าใช้งานครั้งแรก
        </h2>
        <p className="mt-1 text-xs text-slate-300 font-medium">
          บัญชี: {user?.name} (รหัส {user?.employee_code})
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white text-slate-900 py-6 px-6 sm:px-8 rounded-3xl shadow-card border border-white/20">
          
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2 mb-4">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span className="font-medium">
              เพื่อความปลอดภัยของระบบตรวจสอบอุปกรณ์ประจำรถพยาบาล ผู้ใช้งานต้องเปลี่ยนรหัสผ่านเริ่มต้นเป็นรหัสผ่านส่วนตัวก่อนเข้าสู่หน้าหลัก
            </span>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-800 mb-4">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                รหัสผ่านใหม่ <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                placeholder="อย่างน้อย 6 ตัวอักษร"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-ems-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ยืนยันรหัสผ่านใหม่ <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-ems-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-sm font-extrabold text-white bg-ems-navy hover:bg-ems-blue transition active:scale-98 shadow flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <span>กำลังบันทึกรหัสผ่าน...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>บันทึกรหัสผ่านและเริ่มใช้งาน</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={logout}
              className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 text-center"
            >
              ยกเลิกและออกจากระบบ
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
