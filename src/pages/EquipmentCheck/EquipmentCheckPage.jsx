import React, { useState, useEffect, useRef } from 'react';
import {
  Ambulance,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  Save,
  FileText,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Filter,
  Check,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getVehicles } from '../../services/vehicleService';
import { getEquipmentList } from '../../services/equipmentService';
import {
  saveInspectionBatch,
  checkExistingInspection
} from '../../services/inspectionService';
import {
  saveInspectionDraft,
  getInspectionDraft,
  clearInspectionDraft
} from '../../services/offlineDraftService';
import { exportInspectionToPDF } from '../../services/exportService';
import {
  createInitialInspectionItems,
  applyBulkReadyForGeneralItems,
  validateInspectionSubmission
} from '../../utils/validationUtils';
import {
  formatThaiDate,
  formatThaiTime,
  getFormattedLiveDateTime,
  getMonthYearOptions
} from '../../utils/dateUtils';
import { EQUIPMENT_CATEGORIES } from '../../constants/defaultEquipment';
import LiveClock from '../../components/common/LiveClock';
import EquipmentCard from '../../components/inspection/EquipmentCard';
import InspectionProgressBar from '../../components/inspection/InspectionProgressBar';
import BulkReadyModal from '../../components/inspection/BulkReadyModal';
import MissingItemsAlert from '../../components/inspection/MissingItemsAlert';
import InspectionSummaryModal from '../../components/inspection/InspectionSummaryModal';

export default function EquipmentCheckPage({
  initialVehicle = null,
  initialShift = null,
  onNavigate
}) {
  const { user } = useAuth();
  const toast = useToast();
  const today = getFormattedLiveDateTime();

  // Selection state
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(initialVehicle);
  const [inspectionDate, setInspectionDate] = useState(today.isoDate);
  const [shift, setShift] = useState(initialShift || 'MORNING');

  // Master & Inspection items
  const [equipmentMaster, setEquipmentMaster] = useState([]);
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [notes, setNotes] = useState('');
  const [startedAt, setStartedAt] = useState(new Date().toISOString());

  // UI & Modals state
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showMissingModal, setShowMissingModal] = useState(false);
  const [missingReport, setMissingReport] = useState({ missingItems: [], missingReasonItems: [] });
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  // Success State after saving
  const [submittedInspection, setSubmittedInspection] = useState(null);

  // Load initial vehicles & equipment master
  useEffect(() => {
    async function loadMasterData() {
      setLoading(true);
      try {
        const vehList = await getVehicles();
        setVehicles(vehList);
        if (!selectedVehicle && vehList.length > 0) {
          setSelectedVehicle(initialVehicle || vehList[0]);
        }

        const eqList = await getEquipmentList();
        setEquipmentMaster(eqList);

        // Check if there is an existing local draft
        const draft = getInspectionDraft();
        if (draft && draft.items && draft.items.length > 0) {
          setItems(draft.items);
          if (draft.vehicleId) {
            const v = vehList.find(x => x.id === draft.vehicleId);
            if (v) setSelectedVehicle(v);
          }
          if (draft.inspectionDate) setInspectionDate(draft.inspectionDate);
          if (draft.shift) setShift(draft.shift);
          if (draft.notes) setNotes(draft.notes);
          toast.info('โหลดแบบร่างการตรวจล่าสุดเรียบร้อย');
        } else {
          // Initialize fresh 40 items with NOT_CHECKED
          setItems(createInitialInspectionItems(eqList));
        }
      } catch (err) {
        console.error('Error loading check page data:', err);
        toast.error('ไม่สามารถโหลดข้อมูลเริ่มต้นได้');
      } finally {
        setLoading(false);
      }
    }
    loadMasterData();
  }, []);

  // Check duplicate inspection whenever vehicle / date / shift changes
  useEffect(() => {
    async function checkDuplicate() {
      if (!selectedVehicle || !inspectionDate || !shift) return;
      try {
        const existing = await checkExistingInspection(selectedVehicle.id, inspectionDate, shift);
        setDuplicateWarning(existing);
      } catch (err) {
        console.error('Duplicate check error:', err);
      }
    }
    checkDuplicate();
  }, [selectedVehicle, inspectionDate, shift]);

  // Auto-save draft on items change
  useEffect(() => {
    if (items.length > 0 && !submittedInspection) {
      saveInspectionDraft({
        vehicleId: selectedVehicle?.id,
        inspectionDate,
        shift,
        notes,
        items
      });
    }
  }, [items, selectedVehicle, inspectionDate, shift, notes, submittedInspection]);

  // Item change handler
  const handleItemChange = (updatedItem) => {
    setItems((prevItems) =>
      prevItems.map((item) => (item.equipment_no === updatedItem.equipment_no ? updatedItem : item))
    );
  };

  // Bulk Ready for General Items (Strictly excluding distilled water, O2, fuel, quantitative items)
  const handleApplyBulkReady = () => {
    const updated = applyBulkReadyForGeneralItems(items);
    setItems(updated);
    toast.success('ตั้งค่ารายการทั่วไปเป็น "พร้อมใช้งาน" เรียบร้อย (ยกเว้นน้ำกลั่น, ออกซิเจน, น้ำมัน และรายการระบุจำนวน)');
  };

  // Reset all to NOT_CHECKED
  const handleResetChecklist = () => {
    if (window.confirm('คุณต้องการรีเซ็ตสถานะอุปกรณ์ทั้งหมดเป็น "ยังไม่ได้ตรวจ" ใช่หรือไม่?')) {
      setItems(createInitialInspectionItems(equipmentMaster));
      clearInspectionDraft();
      toast.info('รีเซ็ตรายการตรวจเรียบร้อย');
    }
  };

  // Pre-submission review gate
  const handleReviewSubmission = () => {
    const validation = validateInspectionSubmission({
      vehicleId: selectedVehicle?.id,
      inspectionDate,
      shift,
      inspectorCode: user?.employee_code,
      items
    });

    if (!validation.isValid) {
      setMissingReport({
        missingItems: validation.missingItems,
        missingReasonItems: validation.missingReasonItems
      });
      setShowMissingModal(true);
      return;
    }

    setShowSummaryModal(true);
  };

  // Final Batch Save Execution
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await saveInspectionBatch({
        vehicle: selectedVehicle,
        inspectionDate,
        shift,
        inspector: user,
        items,
        notes,
        startedAt
      });

      setSubmittedInspection(res.inspection);
      setShowSummaryModal(false);
      clearInspectionDraft();
      toast.success('✅ บันทึกผลการตรวจอุปกรณ์ประจำรถพยาบาลสำเร็จ!');
    } catch (err) {
      console.error('Save inspection error:', err);
      toast.error(`❌ ไม่สามารถบันทึกข้อมูลได้: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset flow to inspect another vehicle/shift
  const handleInspectAnother = (nextShift = null) => {
    setSubmittedInspection(null);
    setItems(createInitialInspectionItems(equipmentMaster));
    setNotes('');
    setStartedAt(new Date().toISOString());
    if (nextShift) setShift(nextShift);
  };

  // Filter items by category tab
  const filteredItems = activeCategory === 'ALL'
    ? items
    : items.filter(i => {
        const eq = equipmentMaster.find(e => e.equipment_no === i.equipment_no);
        return eq?.category_code === activeCategory || eq?.category === activeCategory;
      });

  // Calculate summary counts
  const readyCount = items.filter(i => i.status === 'READY').length;
  const notReadyCount = items.filter(i => i.status === 'NOT_READY').length;
  const uncheckedCount = items.length - readyCount - notReadyCount;

  // ==========================================================================
  // VIEW: AFTER SUCCESSFUL SUBMISSION (Requirement #67)
  // ==========================================================================
  if (submittedInspection) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Celebration Banner */}
        <div className="bg-white rounded-3xl p-8 border border-emerald-200 shadow-card space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-extrabold uppercase tracking-wide">
              บันทึกข้อมูลสำเร็จ
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              ✅ บันทึกผลการตรวจสำเร็จ
            </h2>
            <p className="text-sm text-slate-600 font-medium mt-1">
              ข้อมูลถูกบันทึกเข้าสู่ระบบตรวจสอบอุปกรณ์ หน่วยกู้ชีพเทศบาลเมืองพันท้ายนรสิงห์ เรียบร้อยแล้ว
            </p>
          </div>

          {/* Inspection Summary Receipt Card */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-200/80 pb-2">
              <span className="text-slate-500 font-medium">รถพยาบาล:</span>
              <span className="font-extrabold text-ems-navy">{selectedVehicle?.license_plate} ({selectedVehicle?.vehicle_name})</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/80 pb-2">
              <span className="text-slate-500 font-medium">วันที่ตรวจ:</span>
              <span className="font-bold text-slate-800">{formatThaiDate(inspectionDate)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/80 pb-2">
              <span className="text-slate-500 font-medium">รอบการตรวจ:</span>
              <span className="font-bold text-slate-800">{shift === 'MORNING' ? 'เวรเช้า (08:00 - 20:00 น.)' : 'เวรดึก (20:00 - 08:00 น.)'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/80 pb-2">
              <span className="text-slate-500 font-medium">ผู้ตรวจ:</span>
              <span className="font-bold text-slate-800">{user?.name} (รหัส {user?.employee_code})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">เวลาที่บันทึก:</span>
              <span className="font-bold text-slate-800">{formatThaiTime(submittedInspection.completed_at)}</span>
            </div>
          </div>

          {/* Action Buttons (Requirement #67) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => handleInspectAnother()}
              className="py-3 px-4 rounded-xl bg-ems-navy hover:bg-ems-blue text-white font-bold text-sm shadow transition active:scale-95 flex items-center justify-center gap-2"
            >
              <Ambulance className="w-4 h-4" />
              <span>ตรวจรถคันอื่น</span>
            </button>

            <button
              onClick={() => handleInspectAnother(shift === 'MORNING' ? 'NIGHT' : 'MORNING')}
              className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm border border-slate-300 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4" />
              <span>ตรวจเวรอื่น ({shift === 'MORNING' ? 'เวรดึก' : 'เวรเช้า'})</span>
            </button>

            <button
              onClick={() => exportInspectionToPDF(submittedInspection, items, selectedVehicle)}
              className="py-3 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-sm border border-red-200 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4 text-red-600" />
              <span>สร้างเอกสารรายงาน PDF</span>
            </button>

            <button
              onClick={() => onNavigate('/history')}
              className="py-3 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-ems-navy font-bold text-sm border border-blue-200 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              <span>ดูประวัติการตรวจทั้งหมด</span>
            </button>
          </div>

        </div>

      </div>
    );
  }

  // ==========================================================================
  // VIEW: MAIN INSPECTION CHECKLIST
  // ==========================================================================
  return (
    <div className="space-y-6 pb-28">
      
      {/* Top Header & Live Time */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-ems-primary" />
            <span>ตรวจอุปกรณ์ประจำรถพยาบาล</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            หน่วยกู้ชีพเทศบาลเมืองพันท้ายนรสิงห์ (40 รายการ Master Checklist)
          </p>
        </div>

        <LiveClock />
      </div>

      {/* Duplicate Warning Box */}
      {duplicateWarning && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 shadow-sm flex items-start justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-900">
                ⚠️ มีข้อมูลการตรวจสอบแล้วสำหรับรอบนี้
              </h4>
              <p className="text-amber-800 font-medium mt-0.5">
                รถ <strong>{selectedVehicle?.license_plate}</strong> ในวันที่ <strong>{formatThaiDate(inspectionDate)}</strong> ({shift === 'MORNING' ? 'เวรเช้า' : 'เวรดึก'}) ได้รับการตรวจแล้วโดยผู้ตรวจรหัส <strong>{duplicateWarning.inspector_code}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('/history')}
            className="px-3 py-1.5 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition flex-shrink-0"
          >
            ดูข้อมูล
          </button>
        </div>
      )}

      {/* ====================================================================== */}
      {/* SELECTION BAR: VEHICLE, DATE, SHIFT, INSPECTOR (Requirements #5, 6, 7, 8, 28) */}
      {/* ====================================================================== */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-soft space-y-4">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* 1. VEHICLE SELECTOR (กข9745, กค7080, กง3002) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Ambulance className="w-4 h-4 text-ems-primary" />
              <span>เลือกรถพยาบาล <span className="text-red-500">*</span></span>
            </label>
            <select
              value={selectedVehicle?.id || ''}
              onChange={(e) => {
                const found = vehicles.find(v => v.id === e.target.value);
                setSelectedVehicle(found);
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-extrabold text-ems-navy focus:bg-white focus:ring-2 focus:ring-ems-primary"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.license_plate} — {v.vehicle_name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. DATE SELECTOR (Real calendar days 1-31, leap year support) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-ems-primary" />
              <span>วันที่ตรวจสอบ <span className="text-red-500">*</span></span>
            </label>
            <input
              type="date"
              value={inspectionDate}
              onChange={(e) => setInspectionDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-ems-primary"
            />
            <span className="text-[10px] text-slate-500 block mt-1 font-medium">
              ตรงกับ: {formatThaiDate(inspectionDate)}
            </span>
          </div>

          {/* 3. SHIFT SELECTOR (เวรเช้า / เวรดึก) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-ems-primary" />
              <span>รอบการตรวจ (เวร) <span className="text-red-500">*</span></span>
            </label>
            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setShift('MORNING')}
                className={`py-2 px-2 rounded-lg text-xs font-extrabold transition-all ${
                  shift === 'MORNING'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ☀️ เวรเช้า
              </button>
              <button
                type="button"
                onClick={() => setShift('NIGHT')}
                className={`py-2 px-2 rounded-lg text-xs font-extrabold transition-all ${
                  shift === 'NIGHT'
                    ? 'bg-indigo-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🌙 เวรดึก
              </button>
            </div>
          </div>

          {/* 4. INSPECTOR INFO */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-ems-primary" />
              <span>ผู้ตรวจสอบ</span>
            </label>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
              <span className="font-bold text-slate-800 block truncate">{user?.name}</span>
              <span className="text-[10px] text-blue-600 font-semibold">
                รหัส {user?.employee_code} ({user?.position})
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Progress Bar (Requirement #18) */}
      <InspectionProgressBar items={items} />

      {/* Quick Action Toolbar: Bulk Ready Button & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
        
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {EQUIPMENT_CATEGORIES.slice(0, 5).map((cat) => (
            <button
              key={cat.code}
              type="button"
              onClick={() => setActiveCategory(cat.code)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === cat.code
                  ? 'bg-ems-navy text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Bulk Ready & Reset Buttons */}
        <div className="flex items-center gap-2">
          
          {/* BULK READY BUTTON (Requirement #16, 17) */}
          <button
            type="button"
            onClick={() => setShowBulkModal(true)}
            className="px-3.5 py-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 rounded-xl text-xs font-extrabold shadow-sm transition active:scale-95 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>ตั้งค่ารายการทั่วไปเป็นพร้อมใช้งาน</span>
          </button>

          <button
            type="button"
            onClick={handleResetChecklist}
            title="รีเซ็ตผลการตรวจทั้งหมด"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

        </div>

      </div>

      {/* ====================================================================== */}
      {/* 40 EQUIPMENT CHECKLIST CARDS (Requirement #10, 11, 12, 13) */}
      {/* ====================================================================== */}
      <div className="space-y-3.5">
        {filteredItems.map((item, idx) => (
          <EquipmentCard
            key={item.equipment_no}
            item={item}
            index={idx}
            onChange={handleItemChange}
          />
        ))}
      </div>

      {/* Optional Overall Note Field */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-soft">
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          บันทึกหรือหมายเหตุภาพรวมประจำเวร (ถ้ามี)
        </label>
        <textarea
          rows="2"
          placeholder="ระบุข้อความหรือบันทึกเหตุการณ์เพิ่มเติมเกี่ยวกับการตรวจอุปกรณ์ประจำรอบนี้..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:bg-white focus:ring-2 focus:ring-ems-primary"
        />
      </div>

      {/* ====================================================================== */}
      {/* STICKY BOTTOM ACTION BAR (Requirements #81, 65, 66) */}
      {/* ====================================================================== */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-floating px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Progress Indicator */}
          <div className="flex items-center gap-3">
            <div className="text-left">
              <span className="text-[11px] text-slate-500 font-medium block">
                ความคืบหน้าการตรวจ
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-base sm:text-lg font-black tabular-nums ${
                  uncheckedCount === 0 ? 'text-emerald-600' : 'text-slate-800'
                }`}>
                  ตรวจแล้ว {readyCount + notReadyCount} / {items.length}
                </span>
                {uncheckedCount > 0 && (
                  <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200 hidden sm:inline">
                    ขาดอีก {uncheckedCount} รายการ
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Final Submit Button */}
          <button
            type="button"
            onClick={handleReviewSubmission}
            className={`py-3 px-6 sm:px-8 rounded-2xl text-sm font-black text-white shadow-lg transition-all active:scale-95 flex items-center gap-2 ${
              uncheckedCount === 0
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 ring-2 ring-emerald-400/40'
                : 'bg-ems-navy hover:bg-ems-blue shadow-blue-200'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>บันทึกผลการตรวจ</span>
          </button>

        </div>
      </div>

      {/* ====================================================================== */}
      {/* MODALS */}
      {/* ====================================================================== */}
      
      {/* 1. Bulk Ready Warning Modal (Requirement #17) */}
      <BulkReadyModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onConfirm={handleApplyBulkReady}
      />

      {/* 2. Missing Items Alert Modal (Requirement #19) */}
      <MissingItemsAlert
        isOpen={showMissingModal}
        onClose={() => setShowMissingModal(false)}
        missingItems={missingReport.missingItems}
        missingReasonItems={missingReport.missingReasonItems}
      />

      {/* 3. Pre-submission Summary Modal (Requirement #66) */}
      <InspectionSummaryModal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        onConfirm={handleFinalSubmit}
        vehicle={selectedVehicle}
        inspectionDate={inspectionDate}
        shift={shift}
        inspector={user}
        summary={{
          total: items.length,
          readyCount,
          notReadyCount,
          uncheckedCount
        }}
        isSubmitting={isSubmitting}
      />

    </div>
  );
}
