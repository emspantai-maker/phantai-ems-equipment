import React, { useState } from 'react';
import { User, KeyRound, Shield, Phone, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { changePassword } from '../../services/authService';
import { useToast } from '../../context/ToastContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const toast = useToast();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMsg('กรุณากรอกข้อมูลรหัสผ่านให้ครบถ้วน');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await changePassword(user.id, oldPassword, newPassword);
      toast.success('เปลี่ยนรหัสผ่านสำเร็จเรียบร้อย');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
      toast.error(err.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
          <User className="w-6 h-6 text-ems-primary" />
          <span>ข้อมูลส่วนตัว & บัญชีผู้ใช้งาน</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          จัดการข้อมูลประจำตัวและรหัสผ่านเข้าใช้งานระบบตรวจอุปกรณ์กู้ชีพ
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="md:col-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-soft text-center space-y-4">
          <div className="w-20 h-20 bg-ems-navy text-white rounded-3xl flex items-center justify-center font-black text-2xl mx-auto shadow-card">
            {user?.employee_code || user?.name?.charAt(0)}
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">{user?.name}</h3>
            <span className="inline-block mt-1 px-3 py-1 bg-blue-50 text-ems-navy border border-blue-200 text-xs font-bold rounded-full">
              ตำแหน่ง: {user?.position}
            </span>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-left">
            <div className="flex justify-between">
              <span className="text-slate-400">รหัสพนักงาน:</span>
              <span className="font-bold text-slate-800">{user?.employee_code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">ชื่อผู้ใช้:</span>
              <span className="font-bold text-slate-800">{user?.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">ระดับสิทธิ์:</span>
              <span className="font-bold text-ems-primary">{user?.role === 'ADMIN' ? 'ผู้ดูแลระบบ (Admin)' : 'เจ้าหน้าที่กู้ชีพ (User)'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">สถานะ:</span>
              <span className="font-bold text-emerald-600">🟢 อนุมัติพร้อมใช้งาน</span>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <KeyRound className="w-5 h-5 text-ems-primary" />
            <h3 className="text-base font-bold text-slate-900">เปลี่ยนรหัสผ่าน</h3>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                รหัสผ่านเดิม <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                placeholder="กรอกรหัสผ่านเดิม"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-ems-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  รหัสผ่านใหม่ <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-ems-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ยืนยันรหัสผ่านใหม่ <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-ems-primary"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-ems-navy hover:bg-ems-blue text-white rounded-xl font-bold shadow transition active:scale-95 flex items-center gap-2 disabled:opacity-60"
              >
                {loading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
}
