import React, { useState, useEffect } from 'react';
import { Ambulance, Plus, Edit, Trash2, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { getVehicles, addVehicle, updateVehicle, toggleVehicleActive } from '../../services/vehicleService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';

export default function VehicleManagementPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    vehicle_code: '',
    license_plate: '',
    vehicle_name: '',
    description: ''
  });

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const list = await getVehicles(true); // include inactive
      setVehicles(list);
    } catch (err) {
      toast.error('ไม่สามารถโหลดข้อมูลรถพยาบาลได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setFormData({
      vehicle_code: `AMB-0${vehicles.length + 1}`,
      license_plate: '',
      vehicle_name: `รถพยาบาลฉุกเฉิน คันที่ ${vehicles.length + 1}`,
      description: ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (v) => {
    setEditingVehicle(v);
    setFormData({
      vehicle_code: v.vehicle_code,
      license_plate: v.license_plate,
      vehicle_name: v.vehicle_name,
      description: v.description || ''
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.license_plate || !formData.vehicle_name) {
      toast.warning('กรุณากรอกทะเบียนรถและชื่อรถ');
      return;
    }

    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, formData, user);
        toast.success('แก้ไขข้อมูลรถพยาบาลสำเร็จ');
      } else {
        await addVehicle(formData, user);
        toast.success('เพิ่มรถพยาบาลคันใหม่สำเร็จ');
      }
      setModalOpen(false);
      loadVehicles();
    } catch (err) {
      toast.error(err.message || 'บันทึกข้อมูลรถพยาบาลไม่สำเร็จ');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await toggleVehicleActive(id, user);
      toast.info('เปลี่ยนสถานะการใช้งานรถพยาบาลเรียบร้อย');
      loadVehicles();
    } catch (err) {
      toast.error('ไม่สามารถเปลี่ยนสถานะได้');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-soft">
        <div>
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Ambulance className="w-5 h-5 text-ems-primary" />
            <span>จัดการรถพยาบาลประจำการ (Vehicle Fleet Management)</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            เพิ่ม แก้ไข หรือ ปิดการใช้งานรถพยาบาลโดยไม่ต้องแก้ไข Code ในระบบ
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-ems-navy hover:bg-ems-blue text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ เพิ่มรถพยาบาลคันใหม่</span>
        </button>
      </div>

      {/* Vehicles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {vehicles.map((v) => (
          <div
            key={v.id}
            className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
              v.active
                ? 'bg-white border-slate-200 shadow-soft'
                : 'bg-slate-50 border-slate-200 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase">
                  {v.vehicle_code}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  v.active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {v.active ? 'พร้อมประจำการ' : 'ปิดใช้งาน'}
                </span>
              </div>

              <h4 className="text-xl font-black text-ems-navy mb-1">
                {v.license_plate}
              </h4>
              <p className="text-xs font-bold text-slate-700">
                {v.vehicle_name}
              </p>
              {v.description && (
                <p className="text-[11px] text-slate-500 mt-1">
                  {v.description}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => handleOpenEdit(v)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold flex items-center gap-1 transition"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>แก้ไข</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleActive(v.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  v.active
                    ? 'bg-red-50 text-red-700 hover:bg-red-100'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                {v.active ? 'ปิดใช้งาน (Soft Delete)' : 'เปิดใช้งาน'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Vehicle Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingVehicle ? 'แก้ไขข้อมูลรถพยาบาล' : 'เพิ่มรถพยาบาลคันใหม่'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              รหัสรถ (Vehicle Code)
            </label>
            <input
              type="text"
              required
              placeholder="เช่น AMB-01"
              value={formData.vehicle_code}
              onChange={(e) => setFormData({ ...formData, vehicle_code: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-ems-primary"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              ป้ายทะเบียนรถ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="เช่น กข9745 หรือ กง3002"
              value={formData.license_plate}
              onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-ems-navy focus:bg-white focus:ring-2 focus:ring-ems-primary"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              ชื่อเรียกของรถพยาบาล <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="เช่น รถพยาบาลฉุกเฉิน คันที่ 1"
              value={formData.vehicle_name}
              onChange={(e) => setFormData({ ...formData, vehicle_name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-ems-primary"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              รายละเอียด / ประเภทรถ
            </label>
            <input
              type="text"
              placeholder="เช่น Advance Life Support (ALS)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-ems-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-ems-navy hover:bg-ems-blue text-white rounded-xl font-bold shadow"
            >
              บันทึกข้อมูลรถ
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
