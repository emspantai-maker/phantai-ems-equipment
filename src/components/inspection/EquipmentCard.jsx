import React from 'react';
import {
  Check,
  X,
  AlertCircle,
  Fuel,
  Activity,
  Droplets,
  Layers,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { evaluateOxygenStatus, evaluateQuantityStatus } from '../../utils/validationUtils';

export default function EquipmentCard({ item, index, onChange }) {
  const isChecked = item.status === 'READY' || item.status === 'NOT_READY';
  const isReady = item.status === 'READY';
  const isNotReady = item.status === 'NOT_READY';
  const isNotChecked = !item.status || item.status === 'NOT_CHECKED';

  // Handler for direct status toggle
  const handleStatusSelect = (newStatus) => {
    onChange({
      ...item,
      status: newStatus,
      reason: newStatus === 'READY' ? '' : item.reason,
      checked_at: new Date().toISOString()
    });
  };

  // Handler for Distilled Water (Item 5)
  const handleWaterSelect = (newStatus) => {
    onChange({
      ...item,
      status: newStatus,
      reason: newStatus === 'READY' ? '' : (item.reason || 'น้ำกลั่นไม่เพียงพอ'),
      checked_at: new Date().toISOString()
    });
  };

  // Handler for Fuel (Item 6)
  const handleFuelSelect = (fuelVal) => {
    const isFuelReady = fuelVal === 'MORE_THAN_HALF' || fuelVal === 'EQUAL_HALF';
    onChange({
      ...item,
      available_quantity: fuelVal,
      status: isFuelReady ? 'READY' : 'NOT_READY',
      reason: isFuelReady ? '' : (item.reason || 'น้ำมันต่ำกว่า 1/2 ถัง ต้องเติมน้ำมัน'),
      checked_at: new Date().toISOString()
    });
  };

  // Handler for Oxygen Pressure (Items 36, 37, 38)
  const handleOxygenChange = (psiVal) => {
    const evalRes = evaluateOxygenStatus(psiVal, 500);
    onChange({
      ...item,
      available_quantity: psiVal,
      status: evalRes.status,
      reason: evalRes.status === 'NOT_READY' ? (item.reason || 'แรงดันออกซิเจนต่ำกว่า 500 psi') : '',
      checked_at: new Date().toISOString()
    });
  };

  // Handler for Minimum Quantity (Hard Collar, DTX, Splints, Masks, etc.)
  const handleQuantityChange = (qtyVal) => {
    const evalRes = evaluateQuantityStatus(qtyVal, item.minimum_quantity);
    onChange({
      ...item,
      available_quantity: qtyVal,
      status: evalRes.status,
      reason: evalRes.status === 'NOT_READY' ? (item.reason || `จำนวนไม่ครบตามเกณฑ์ (${item.minimum_quantity} ${item.unit})`) : '',
      checked_at: new Date().toISOString()
    });
  };

  // Step helper for stepper buttons
  const stepQuantity = (delta) => {
    const current = parseInt(item.available_quantity, 10) || 0;
    const nextVal = Math.max(0, current + delta);
    handleQuantityChange(nextVal.toString());
  };

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 border transition-all duration-200 shadow-sm ${
        isNotChecked
          ? 'bg-white border-slate-200 hover:border-slate-300'
          : isReady
          ? 'bg-emerald-50/40 border-emerald-300/80 shadow-emerald-50'
          : 'bg-red-50/50 border-red-300 shadow-red-50'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        
        {/* Item Number & Title */}
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 border shadow-xs ${
              isReady
                ? 'bg-emerald-600 text-white border-emerald-700'
                : isNotReady
                ? 'bg-red-600 text-white border-red-700'
                : 'bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            {item.equipment_no.toString().padStart(2, '0')}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {item.equipment_name}
              </h3>
              {item.is_mandatory && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-red-100 text-red-700 border border-red-200">
                  บังคับตรวจทุกวัน
                </span>
              )}
            </div>

            {/* Requirement / Criteria Subtitle */}
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <span className="text-slate-400">เกณฑ์:</span>
              <span className="text-slate-700 font-semibold">{item.requirement || 'ตรวจสภาพพร้อมใช้งาน'}</span>
              {item.minimum_quantity > 1 && (
                <span className="text-blue-600 font-bold ml-1">
                  (ขั้นต่ำ {item.minimum_quantity} {item.unit})
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Current State Badge */}
        <div>
          {isNotChecked && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              ยังไม่ได้ตรวจ
            </span>
          )}
          {isReady && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              พร้อมใช้งาน
            </span>
          )}
          {isNotReady && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
              <X className="w-3.5 h-3.5 text-red-600" />
              ไม่พร้อมใช้งาน
            </span>
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* CARD INTERACTION BODY ACCORDING TO ITEM TYPE */}
      {/* ========================================================================= */}

      {/* 1. DISTILLED WATER (Item 5) - MANDATORY CHECK */}
      {item.check_type === 'MANDATORY_WATER' && (
        <div className="space-y-3 pt-2">
          <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-200 text-xs text-blue-800 flex items-center gap-2 font-medium">
            <Droplets className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>น้ำกลั่นเป็นรายการสำคัญ บังคับตรวจด้วยตนเองทุกวัน (ไม่รองรับ Auto Ready)</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleWaterSelect('READY')}
              className={`py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border transition-all active:scale-95 ${
                isReady
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-400/40'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-emerald-50 hover:border-emerald-300'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>🟢 พร้อมใช้งาน</span>
            </button>

            <button
              type="button"
              onClick={() => handleWaterSelect('NOT_READY')}
              className={`py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border transition-all active:scale-95 ${
                isNotReady
                  ? 'bg-red-600 text-white border-red-700 shadow-md ring-2 ring-red-400/40'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-red-50 hover:border-red-300'
              }`}
            >
              <X className="w-4 h-4" />
              <span>🔴 ไม่พร้อมใช้งาน</span>
            </button>
          </div>

          {/* Water Reason Selection if Not Ready */}
          {isNotReady && (
            <div className="p-3 bg-red-50 rounded-xl border border-red-200 space-y-2 animate-in fade-in duration-150">
              <label className="block text-xs font-bold text-red-900">
                ระบุสาเหตุที่ไม่พร้อมใช้งาน <span className="text-red-600">*</span>
              </label>
              <select
                value={item.reason || ''}
                onChange={(e) => onChange({ ...item, reason: e.target.value })}
                className="w-full bg-white border border-red-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">-- กรุณาเลือกเหตุผล --</option>
                <option value="น้ำกลั่นหมด">น้ำกลั่นหมด</option>
                <option value="น้ำกลั่นไม่เพียงพอ">น้ำกลั่นไม่เพียงพอ</option>
                <option value="ต้องเติมน้ำกลั่น">ต้องเติมน้ำกลั่น</option>
                <option value="ภาชนะชำรุด">ภาชนะชำรุด</option>
                <option value="อื่นๆ">อื่นๆ (ระบุในหมายเหตุ)</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* 2. FUEL LEVEL (Item 6) */}
      {item.check_type === 'FUEL_LEVEL' && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-1">
            <Fuel className="w-4 h-4 text-amber-600" />
            <span>ระดับน้ำมันในถัง (เกณฑ์: ไม่ต่ำกว่า 1/2 ถัง)</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'มากกว่า 1/2 ถัง', val: 'MORE_THAN_HALF', color: 'emerald' },
              { label: 'เท่ากับ 1/2 ถัง', val: 'EQUAL_HALF', color: 'emerald' },
              { label: 'ต่ำกว่า 1/2 ถัง', val: 'LESS_THAN_HALF', color: 'red' }
            ].map((opt) => {
              const isSelected = item.available_quantity === opt.val;
              return (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => handleFuelSelect(opt.val)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all active:scale-95 text-center ${
                    isSelected
                      ? opt.color === 'emerald'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-400/40'
                        : 'bg-red-600 text-white border-red-700 shadow-md ring-2 ring-red-400/40'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {isNotReady && (
            <div className="p-3 bg-red-50 rounded-xl border border-red-200 space-y-2 animate-in fade-in duration-150">
              <label className="block text-xs font-bold text-red-900">
                เหตุผลที่น้ำมันไม่พร้อมใช้งาน <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                placeholder="เช่น น้ำมันต่ำกว่า 1/2 ถัง ต้องเติมก่อนออกปฏิบัติการ"
                value={item.reason || ''}
                onChange={(e) => onChange({ ...item, reason: e.target.value })}
                className="w-full bg-white border border-red-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          )}
        </div>
      )}

      {/* 3. OXYGEN CYLINDERS (Items 36, 37, 38) */}
      {item.check_type === 'OXYGEN_PRESSURE' && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-600" />
              แรงดันออกซิเจน (เกณฑ์ไม่ต่ำกว่า 500 psi):
            </span>
            {item.available_quantity && (
              <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
                isReady ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}>
                {isReady ? '🟢 ผ่านเกณฑ์' : '🔴 ต่ำกว่าเกณฑ์'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                min="0"
                max="3000"
                step="50"
                placeholder="กรอกค่า psi (เช่น 2000, 1500, 450)"
                value={item.available_quantity !== null && item.available_quantity !== undefined ? item.available_quantity : ''}
                onChange={(e) => handleOxygenChange(e.target.value)}
                className={`w-full font-bold text-base px-3 py-2.5 rounded-xl border transition-all ${
                  isReady
                    ? 'border-emerald-400 bg-emerald-50/50 text-emerald-900 focus:ring-emerald-500'
                    : isNotReady
                    ? 'border-red-400 bg-red-50/50 text-red-900 focus:ring-red-500'
                    : 'border-slate-300 bg-white text-slate-900 focus:ring-ems-primary'
                }`}
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                psi
              </span>
            </div>

            {/* Quick Presets */}
            <div className="flex gap-1">
              {[2000, 1500, 1000, 500].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleOxygenChange(preset.toString())}
                  className="px-2 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 active:scale-95"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {isNotReady && (
            <div className="p-3 bg-red-50 rounded-xl border border-red-200 space-y-2 animate-in fade-in duration-150">
              <label className="block text-xs font-bold text-red-900">
                เหตุผลที่ออกซิเจนไม่พร้อมใช้งาน <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                placeholder="เช่น แรงดันต่ำกว่า 500 psi ต้องเปลี่ยนถังออกซิเจน"
                value={item.reason || ''}
                onChange={(e) => onChange({ ...item, reason: e.target.value })}
                className="w-full bg-white border border-red-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          )}
        </div>
      )}

      {/* 4. QUANTITATIVE / MINIMUM QUANTITY ITEMS (Hard Collar=3, Splints=4, Masks=3, DTX=1, Boots=2) */}
      {item.check_type === 'MINIMUM_QUANTITY' && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              จำนวนที่ตรวจพบ (เกณฑ์ขั้นต่ำ {item.minimum_quantity} {item.unit}):
            </span>
            {item.available_quantity !== '' && item.available_quantity !== null && item.available_quantity !== undefined && (
              <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
                isReady ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}>
                {isReady ? `🟢 ครบตามเกณฑ์ (≥ ${item.minimum_quantity})` : `🔴 ไม่ครบตามเกณฑ์ (< ${item.minimum_quantity})`}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Stepper Down */}
            <button
              type="button"
              onClick={() => stepQuantity(-1)}
              className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-lg text-slate-700 active:scale-95"
            >
              -
            </button>

            {/* Quantity Input */}
            <input
              type="number"
              min="0"
              placeholder={`ขั้นต่ำ ${item.minimum_quantity}`}
              value={item.available_quantity !== null && item.available_quantity !== undefined ? item.available_quantity : ''}
              onChange={(e) => handleQuantityChange(e.target.value)}
              className={`flex-1 text-center font-extrabold text-lg px-3 py-2 rounded-xl border transition-all ${
                isReady
                  ? 'border-emerald-400 bg-emerald-50/50 text-emerald-900'
                  : isNotReady
                  ? 'border-red-400 bg-red-50/50 text-red-900'
                  : 'border-slate-300 bg-white text-slate-900'
              }`}
            />

            {/* Stepper Up */}
            <button
              type="button"
              onClick={() => stepQuantity(1)}
              className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-lg text-slate-700 active:scale-95"
            >
              +
            </button>

            {/* Exact Min Match Shortcut */}
            <button
              type="button"
              onClick={() => handleQuantityChange(item.minimum_quantity.toString())}
              className="px-3 py-2.5 rounded-xl bg-blue-50 text-ems-navy hover:bg-blue-100 border border-blue-200 text-xs font-bold active:scale-95"
            >
              ครบ {item.minimum_quantity} {item.unit}
            </button>
          </div>

          {isNotReady && (
            <div className="p-3 bg-red-50 rounded-xl border border-red-200 space-y-2 animate-in fade-in duration-150">
              <label className="block text-xs font-bold text-red-900">
                ระบุเหตุผลที่ไม่ครบตามเกณฑ์ <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                placeholder={`เช่น พบเพียง ${item.available_quantity || 0} ${item.unit} สูญหายหรือนำไปทำความสะอาด`}
                value={item.reason || ''}
                onChange={(e) => onChange({ ...item, reason: e.target.value })}
                className="w-full bg-white border border-red-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          )}
        </div>
      )}

      {/* 5. ADEQUATE ("พอใช้") ITEMS (กระเป๋าพยาบาล, Ambu Bag, สาย Suction, ถุงมือ) */}
      {item.check_type === 'ADEQUATE_CHECK' && (
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleStatusSelect('READY')}
              className={`py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border transition-all active:scale-95 ${
                isReady
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-400/40'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-emerald-50 hover:border-emerald-300'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>🟢 พอใช้ / พร้อมใช้งาน</span>
            </button>

            <button
              type="button"
              onClick={() => handleStatusSelect('NOT_READY')}
              className={`py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border transition-all active:scale-95 ${
                isNotReady
                  ? 'bg-red-600 text-white border-red-700 shadow-md ring-2 ring-red-400/40'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-red-50 hover:border-red-300'
              }`}
            >
              <X className="w-4 h-4" />
              <span>🔴 ไม่พอ / ไม่พร้อมใช้</span>
            </button>
          </div>

          {isNotReady && (
            <div className="p-3 bg-red-50 rounded-xl border border-red-200 space-y-2 animate-in fade-in duration-150">
              <label className="block text-xs font-bold text-red-900">
                ระบุสาเหตุที่ไม่พอหรือไม่พร้อมใช้งาน <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                placeholder="เช่น ปริมาณไม่เพียงพอต่อการปฏิบัติการ, ชำรุด"
                value={item.reason || ''}
                onChange={(e) => onChange({ ...item, reason: e.target.value })}
                className="w-full bg-white border border-red-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          )}
        </div>
      )}

      {/* 6. CLEANLINESS (ความสะอาดภายใน/ภายนอก) */}
      {item.check_type === 'CLEANLINESS_CHECK' && (
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleStatusSelect('READY')}
              className={`py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border transition-all active:scale-95 ${
                isReady
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-400/40'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-emerald-50 hover:border-emerald-300'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>🟢 สะอาด / พร้อมใช้งาน</span>
            </button>

            <button
              type="button"
              onClick={() => handleStatusSelect('NOT_READY')}
              className={`py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border transition-all active:scale-95 ${
                isNotReady
                  ? 'bg-red-600 text-white border-red-700 shadow-md ring-2 ring-red-400/40'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-red-50 hover:border-red-300'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              <span>🔴 ไม่สะอาด / ต้องดำเนินการ</span>
            </button>
          </div>

          {isNotReady && (
            <div className="p-3 bg-red-50 rounded-xl border border-red-200 space-y-2 animate-in fade-in duration-150">
              <label className="block text-xs font-bold text-red-900">
                ระบุรายละเอียดที่ต้องทำความสะอาด <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                placeholder="เช่น มีคราบเลือดในห้องพยาบาล ต้องล้างฆ่าเชื้อด่วน"
                value={item.reason || ''}
                onChange={(e) => onChange({ ...item, reason: e.target.value })}
                className="w-full bg-white border border-red-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          )}
        </div>
      )}

      {/* 7. NORMAL GENERAL EQUIPMENT */}
      {item.check_type === 'NORMAL' && (
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleStatusSelect('READY')}
              className={`py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border transition-all active:scale-95 ${
                isReady
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-400/40'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-emerald-50 hover:border-emerald-300'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>🟢 พร้อมใช้งาน</span>
            </button>

            <button
              type="button"
              onClick={() => handleStatusSelect('NOT_READY')}
              className={`py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border transition-all active:scale-95 ${
                isNotReady
                  ? 'bg-red-600 text-white border-red-700 shadow-md ring-2 ring-red-400/40'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-red-50 hover:border-red-300'
              }`}
            >
              <X className="w-4 h-4" />
              <span>🔴 ไม่พร้อมใช้งาน</span>
            </button>
          </div>

          {isNotReady && (
            <div className="p-3 bg-red-50 rounded-xl border border-red-200 space-y-2 animate-in fade-in duration-150">
              <label className="block text-xs font-bold text-red-900">
                ระบุเหตุผลที่ไม่พร้อมใช้งาน <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                placeholder="เช่น ชำรุด, แบตเตอรี่หมด, นำส่งซ่อม"
                value={item.reason || ''}
                onChange={(e) => onChange({ ...item, reason: e.target.value })}
                className="w-full bg-white border border-red-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          )}
        </div>
      )}

      {/* Optional Note Field for Any Item */}
      <div className="mt-3 pt-2 border-t border-slate-100">
        <input
          type="text"
          placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)..."
          value={item.note || ''}
          onChange={(e) => onChange({ ...item, note: e.target.value })}
          className="w-full text-xs bg-slate-50/70 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 placeholder-slate-400 focus:bg-white focus:ring-1 focus:ring-ems-primary"
        />
      </div>

    </div>
  );
}
