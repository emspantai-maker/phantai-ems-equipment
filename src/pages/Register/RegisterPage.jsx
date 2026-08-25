import React, { useState } from 'react';
import { UserPlus, Lock, User, BadgeAlert, CheckCircle2, ArrowLeft, AlertCircle } from 'lucide-react';
import { registerUser } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import LiveClock from '../../components/common/LiveClock';

export default function RegisterPage({ onNavigate }) {
  const toast = useToast();

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    employee_code: '',
    position: 'EMT',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.name || !formData.employee_code || !formData.password) {
      setErrorMessage('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      await registerUser({
        username: formData.username,
        name: formData.name,
        employee_code: formData.employee_code,
        position: formData.position,
        password: formData.password
      });

      setSuccessMessage('ลงทะเบียนสำเร็จ บัญชีของคุณอยู่ระหว่างรอการอนุมัติจากผู้ดูแลระบบ');
      toast.success('ลงทะเบียนสำเร็จ รอการอนุมัติ');
    } catch (err) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการลงทะเบียน');
      toast.error(err.message || 'ลงทะเบียนไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ems-navy via-ems-dark to-slate-900 flex flex-col justify-center py-10 sm:px-6 lg:px-8 px-4 text-white">
      
      <div className="flex justify-center mb-4">
        <LiveClock />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-16 h-16 bg-white/10 p-2 rounded-2xl backdrop-blur border border-white/20 shadow-xl flex items-center justify-center mb-3">
          <img src="/icons/logo-ems.svg" alt="Phantai EMS" className="w-full h-full object-contain" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white">
          สมัครสมาชิกใหม่
        </h2>
        <p className="text-xs font-semibold text-blue-300">
          หน่วยกู้ชีพเทศบาลเมืองพันท้ายนรสิงห์
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white text-slate-900 py-6 px-6 sm:px-8 rounded-3xl shadow-card border border-white/20">
          
          {successMessage ? (
            <div className="space-y-4 text-center py-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                ลงทะเบียนเรียบร้อยแล้ว
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {successMessage}
                <br />
                เมื่อผู้ดูแลระบบ (Admin) ทำการอนุมัติแล้ว ท่านจะสามารถเข้าสู่ระบบเพื่อตรวจเช็คอุปกรณ์ได้ทันที
              </p>
              <button
                type="button"
                onClick={() => onNavigate('/login')}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-ems-navy hover:bg-ems-blue transition shadow"
              >
                กลับไปหน้าเข้าสู่ระบบ
              </button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-800">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">{errorMessage}</span>
                </div>
              )}

              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อผู้ใช้งาน (Username) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น phantai330"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-ems-primary"
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อ-นามสกุล <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น นายกู้ชีพ สุขใจ"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-ems-primary"
                />
              </div>

              {/* Employee Code & Position */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    รหัสพนักงาน <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น 330"
                    value={formData.employee_code}
                    onChange={(e) => handleChange('employee_code', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-ems-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ตำแหน่ง <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) => handleChange('position', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 bg-white focus:ring-2 focus:ring-ems-primary"
                  >
                    <option value="EMT">EMT</option>
                    <option value="EMR">EMR</option>
                    <option value="PARAMEDIC">Paramedic</option>
                    <option value="DRIVER">พนักงานขับรถพยาบาล</option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  รหัสผ่าน <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-ems-primary"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-ems-primary"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 font-medium">
                ⚠️ หลังลงทะเบียน สถานะบัญชีจะเป็น <strong>“รอการอนุมัติ”</strong> โดย Admin จะเป็นผู้ตรวจสอบและอนุมัติสิทธิ์การเข้าใช้งาน
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-ems-navy hover:bg-ems-blue transition active:scale-98 shadow flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <span>กำลังลงทะเบียน...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>ยืนยันการสมัครสมาชิก</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onNavigate('/login')}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>กลับไปหน้าเข้าสู่ระบบ</span>
              </button>

            </form>
          )}

        </div>
      </div>
    </div>
  );
}
