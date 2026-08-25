import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit, Check, X, Search, AlertCircle, ShieldAlert } from 'lucide-react';
import { getEquipmentList, addEquipment, updateEquipment, toggleEquipmentActive } from '../../services/equipmentService';
import { EQUIPMENT_CATEGORIES } from '../../constants/defaultEquipment';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';

export default function EquipmentManagementPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    equipment_no: 1,
    equipment_name: '',
    category: 'ยานพาหนะและความปลอดภัย',
    category_code: 'VEHICLE',
    minimum_quantity: 1,
    unit: 'ชิ้น',
    requirement: '',
    is_mandatory: false,
    is_quantitative: false,
    allow_bulk_ready: true,
    check_type: 'NORMAL'
  });

  const loadEquipment = async () => {
    setLoading(true);
    try {
      const list = await getEquipmentList(true); // include inactive
      setEquipment(list);
    } catch (err) {
      toast.error('ไม่สามารถโหลดรายการอุปกรณ์ได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEquipment();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      equipment_no: equipment.length + 1,
      equipment_name: '',
      category: 'ยานพาหนะและความปลอดภัย',
      category_code: 'VEHICLE',
      minimum_quantity: 1,
      unit: 'ชิ้น',
      requirement: '',
      is_mandatory: false,
      is_quantitative: false,
      allow_bulk_ready: true,
      check_type: 'NORMAL'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (eq) => {
    setEditingItem(eq);
    setFormData({
      equipment_no: eq.equipment_no,
      equipment_name: eq.equipment_name,
      category: eq.category || 'ทั่วไป',
      category_code: eq.category_code || 'GENERAL',
      minimum_quantity: eq.minimum_quantity || 1,
      unit: eq.unit || 'ชิ้น',
      requirement: eq.requirement || '',
      is_mandatory: Boolean(eq.is_mandatory),
      is_quantitative: Boolean(eq.is_quantitative),
      allow_bulk_ready: eq.allow_bulk_ready !== false,
      check_type: eq.check_type || 'NORMAL'
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.equipment_name) {
      toast.warning('กรุณากรอกชื่ออุปกรณ์');
      return;
    }

    try {
      if (editingItem) {
        await updateEquipment(editingItem.id, formData, user);
        toast.success('แก้ไขข้อมูลอุปกรณ์สำเร็จ');
      } else {
        await addEquipment(formData, user);
        toast.success('เพิ่มรายการอุปกรณ์ใหม่สำเร็จ');
      }
      setModalOpen(false);
      loadEquipment();
    } catch (err) {
      toast.error(err.message || 'บันทึกอุปกรณ์ไม่สำเร็จ');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await toggleEquipmentActive(id, user);
      toast.info('เปลี่ยนสถานะการใช้งานอุปกรณ์เรียบร้อย');
      loadEquipment();
    } catch (err) {
      toast.error('ไม่สามารถเปลี่ยนสถานะได้');
    }
  };

  const filtered = equipment.filter((eq) => {
    const s = search.toLowerCase();
    const matchSearch =
      !s ||
      eq.equipment_name.toLowerCase().includes(s) ||
      eq.equipment_no.toString().includes(s);

    const matchCat = !filterCategory || eq.category_code === filterCategory || eq.category === filterCategory;

    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-soft">
        <div>
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-ems-primary" />
            <span>จัดการรายการอุปกรณ์ Master (Equipment Master Catalog)</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            เพิ่ม แก้ไข หรือ ปิดการใช้งานอุปกรณ์ประจำรถพยาบาล (ปัจจุบันมี {equipment.length} รายการ)
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-ems-navy hover:bg-ems-blue text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ เพิ่มอุปกรณ์ใหม่</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-soft flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาอุปกรณ์ตามลำดับ, ชื่อ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white"
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
        >
          <option value="">-- ทุกหมวดหมู่อุปกรณ์ --</option>
          {EQUIPMENT_CATEGORIES.map(c => (
            <option key={c.code} value={c.code}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Equipment Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3 text-center w-12">ลำดับ</th>
                <th className="py-3 px-4">ชื่ออุปกรณ์</th>
                <th className="py-3 px-3">หมวดหมู่</th>
                <th className="py-3 px-3 text-center">เกณฑ์ขั้นต่ำ</th>
                <th className="py-3 px-3 text-center">ประเภทตรวจ</th>
                <th className="py-3 px-3 text-center">Auto Ready?</th>
                <th className="py-3 px-3 text-center">สถานะ</th>
                <th className="py-3 px-4 text-right">การกระทำ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((eq) => (
                <tr key={eq.id || eq.equipment_no} className="hover:bg-slate-50 transition-colors">
                  
                  <td className="py-3 px-3 text-center font-bold text-slate-400">
                    {eq.equipment_no}
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-extrabold text-slate-900">{eq.equipment_name}</div>
                    {eq.requirement && (
                      <div className="text-[10px] text-slate-500 font-medium">เกณฑ์: {eq.requirement}</div>
                    )}
                  </td>

                  <td className="py-3 px-3 text-slate-600">{eq.category || eq.category_code}</td>

                  <td className="py-3 px-3 text-center font-bold text-slate-700">
                    {eq.minimum_quantity} {eq.unit}
                  </td>

                  <td className="py-3 px-3 text-center">
                    {eq.is_mandatory ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                        บังคับตรวจทุกวัน
                      </span>
                    ) : eq.is_quantitative ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        ระบุค่าตัวเลข
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">ทั่วไป</span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-center">
                    {eq.allow_bulk_ready ? (
                      <span className="text-emerald-600 font-bold text-xs">✓ ได้</span>
                    ) : (
                      <span className="text-red-600 font-bold text-xs">✕ ห้าม</span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-center">
                    {eq.active ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">ใช้งาน</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700">ปิดใช้งาน</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(eq)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                      >
                        แก้ไข
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(eq.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                          eq.active ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {eq.active ? 'ปิด' : 'เปิด'}
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'แก้ไขรายการอุปกรณ์' : 'เพิ่มรายการอุปกรณ์ใหม่'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                ลำดับที่ (Equipment No) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                value={formData.equipment_no}
                onChange={(e) => setFormData({ ...formData, equipment_no: parseInt(e.target.value, 10) })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                หมวดหมู่อุปกรณ์
              </label>
              <select
                value={formData.category_code}
                onChange={(e) => {
                  const cat = EQUIPMENT_CATEGORIES.find(c => c.code === e.target.value);
                  setFormData({
                    ...formData,
                    category_code: e.target.value,
                    category: cat?.label || 'ทั่วไป'
                  });
                }}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
              >
                {EQUIPMENT_CATEGORIES.filter(c => c.code !== 'ALL').map(c => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              ชื่ออุปกรณ์ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="เช่น เครื่องวัดความดันโลหิต"
              value={formData.equipment_name}
              onChange={(e) => setFormData({ ...formData, equipment_name: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                จำนวนขั้นต่ำ
              </label>
              <input
                type="number"
                min="1"
                value={formData.minimum_quantity}
                onChange={(e) => setFormData({ ...formData, minimum_quantity: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                หน่วยนับ
              </label>
              <input
                type="text"
                placeholder="เช่น ชิ้น, ชุด, เครื่อง, คู่"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              เกณฑ์การตรวจสอบ (Requirement)
            </label>
            <input
              type="text"
              placeholder="เช่น ตรวจทุกวัน, พอใช้, ไม่ต่ำกว่า 500 psi"
              value={formData.requirement}
              onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          {/* Rule Flags */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_mandatory}
                onChange={(e) => setFormData({ ...formData, is_mandatory: e.target.checked })}
                className="rounded text-ems-primary focus:ring-ems-primary"
              />
              <span>รายการบังคับตรวจเข้มงวดทุกวัน (Mandatory Check)</span>
            </label>

            <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_quantitative}
                onChange={(e) => setFormData({ ...formData, is_quantitative: e.target.checked })}
                className="rounded text-ems-primary focus:ring-ems-primary"
              />
              <span>ต้องระบุค่าตัวเลขจริง / จำนวนขั้นต่ำ (Quantitative Check)</span>
            </label>

            <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allow_bulk_ready}
                onChange={(e) => setFormData({ ...formData, allow_bulk_ready: e.target.checked })}
                className="rounded text-ems-primary focus:ring-ems-primary"
              />
              <span>อนุญาตให้ปุ่ม "Auto Ready รายการทั่วไป" เปลี่ยนสถานะได้</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
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
              บันทึกอุปกรณ์
            </button>
          </div>

        </form>
      </Modal>

    </div>
  );
}
