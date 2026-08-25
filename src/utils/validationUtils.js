/**
 * Validation Logic & Business Rules for EMS Equipment Check
 * หน่วยกู้ชีพเทศบาลเมืองพันท้ายนรสิงห์
 */

/**
 * Initialize new inspection state with all items set to NOT_CHECKED
 * กฎเหล็ก: อุปกรณ์ทั้ง 40 รายการต้องเริ่มต้นด้วยสถานะ NOT_CHECKED เสมอ
 */
export function createInitialInspectionItems(equipmentMasterList) {
  return equipmentMasterList.map((eq) => {
    return {
      equipment_id: eq.id,
      equipment_no: eq.equipment_no,
      equipment_name: eq.equipment_name,
      category: eq.category || eq.category_code,
      minimum_quantity: eq.minimum_quantity || 1,
      unit: eq.unit || 'ชิ้น',
      requirement: eq.requirement || '',
      is_mandatory: eq.is_mandatory || false,
      is_quantitative: eq.is_quantitative || false,
      allow_bulk_ready: eq.allow_bulk_ready !== false,
      check_type: eq.check_type || 'NORMAL',
      
      // Mandatory Initial Status: NOT_CHECKED (🔴 ยังไม่ได้ตรวจ)
      status: 'NOT_CHECKED',
      available_quantity: eq.is_quantitative ? '' : null,
      reason: '',
      note: '',
      checked_at: null
    };
  });
}

/**
 * Evaluate Fuel Level status
 * - MORE_THAN_HALF -> READY
 * - EQUAL_HALF -> READY
 * - LESS_THAN_HALF -> NOT_READY (บังคับกรอกเหตุผล)
 */
export function evaluateFuelStatus(fuelValue) {
  if (!fuelValue) return { status: 'NOT_CHECKED', is_ready: false };
  if (fuelValue === 'LESS_THAN_HALF') {
    return { status: 'NOT_READY', is_ready: false };
  }
  return { status: 'READY', is_ready: true };
}

/**
 * Evaluate Oxygen Cylinder Pressure status
 * - Minimum: 500 psi
 * - If value >= 500 -> READY
 * - If value < 500 -> NOT_READY (บังคับกรอกเหตุผล)
 */
export function evaluateOxygenStatus(psiValue, minThreshold = 500) {
  if (psiValue === '' || psiValue === null || psiValue === undefined) {
    return { status: 'NOT_CHECKED', is_ready: false };
  }
  const numericVal = parseFloat(psiValue);
  if (isNaN(numericVal)) {
    return { status: 'NOT_CHECKED', is_ready: false };
  }
  if (numericVal >= minThreshold) {
    return { status: 'READY', is_ready: true };
  }
  return { status: 'NOT_READY', is_ready: false };
}

/**
 * Evaluate Minimum Quantity status
 * - If available >= min_qty -> READY
 * - If available < min_qty -> NOT_READY (บังคับกรอกเหตุผล)
 */
export function evaluateQuantityStatus(availableQty, minQty = 1) {
  if (availableQty === '' || availableQty === null || availableQty === undefined) {
    return { status: 'NOT_CHECKED', is_ready: false };
  }
  const numericVal = parseFloat(availableQty);
  if (isNaN(numericVal)) {
    return { status: 'NOT_CHECKED', is_ready: false };
  }
  if (numericVal >= minQty) {
    return { status: 'READY', is_ready: true };
  }
  return { status: 'NOT_READY', is_ready: false };
}

/**
 * Apply Bulk Ready to general items ONLY
 * กฎเหล็ก:
 * ห้ามเปลี่ยนสถานะของ:
 * 1. น้ำกลั่น (Distilled Water - eq 5)
 * 2. น้ำมันเชื้อเพลิง (Fuel - eq 6)
 * 3. ออกซิเจน No.1, No.2, No.3 (eq 36, 37, 38)
 * 4. รายการที่ต้องระบุจำนวนขั้นต่ำ (Hard Collar, DTX, ไม้ดาม, หน้ากาก, บูธ ฯลฯ)
 * 5. รายการ Mandatory / Quantitative
 */
export function applyBulkReadyForGeneralItems(currentItems) {
  const now = new Date().toISOString();
  return currentItems.map((item) => {
    // If item does not allow bulk ready, keep its existing status untouched
    if (!item.allow_bulk_ready || item.is_mandatory || item.is_quantitative || item.equipment_no === 5) {
      return item;
    }

    // Only apply READY if it was NOT_CHECKED or already checked
    return {
      ...item,
      status: 'READY',
      reason: '',
      checked_at: item.checked_at || now
    };
  });
}

/**
 * Strict Final Validation before Inspection Submission
 * Returns detailed validation report
 */
export function validateInspectionSubmission({
  vehicleId,
  inspectionDate,
  shift,
  inspectorCode,
  items = []
}) {
  const errors = [];
  const missingItems = [];
  const missingReasonItems = [];

  // 1. Header Validation
  if (!vehicleId) errors.push('กรุณาเลือกรถพยาบาลที่ทำการตรวจสอบ');
  if (!inspectionDate) errors.push('กรุณาเลือกวันที่ตรวจสอบ');
  if (!shift) errors.push('กรุณาเลือกรอบการตรวจ (เวรเช้า / เวรดึก)');
  if (!inspectorCode) errors.push('กรุณาระบุรหัสผู้ตรวจ');

  // 2. 40 Items Full Checklist Validation
  if (!items || items.length === 0) {
    errors.push('ไม่พบรายการอุปกรณ์สำหรับการตรวจ');
    return { isValid: false, errors, missingItems, missingReasonItems };
  }

  items.forEach((item) => {
    // A. Check if item is still NOT_CHECKED
    if (!item.status || item.status === 'NOT_CHECKED') {
      missingItems.push({
        equipment_no: item.equipment_no,
        equipment_name: item.equipment_name,
        category: item.category
      });
    }

    // B. Check if quantitative items have values
    if (item.is_quantitative) {
      if (item.equipment_no === 6) {
        // Fuel
        if (!item.available_quantity) {
          if (!missingItems.some(m => m.equipment_no === item.equipment_no)) {
            missingItems.push({
              equipment_no: item.equipment_no,
              equipment_name: item.equipment_name,
              reason: 'ยังไม่ได้เลือกปริมาณน้ำมัน'
            });
          }
        }
      } else if (item.available_quantity === '' || item.available_quantity === null || item.available_quantity === undefined) {
        if (!missingItems.some(m => m.equipment_no === item.equipment_no)) {
          missingItems.push({
            equipment_no: item.equipment_no,
            equipment_name: item.equipment_name,
            reason: 'ยังไม่ได้กรอกค่าตัวเลข/จำนวน'
          });
        }
      }
    }

    // C. Check if NOT_READY items have a reason
    if (item.status === 'NOT_READY' && (!item.reason || item.reason.trim() === '')) {
      missingReasonItems.push({
        equipment_no: item.equipment_no,
        equipment_name: item.equipment_name
      });
    }
  });

  if (missingItems.length > 0) {
    errors.push(`กรุณาตรวจสอบอุปกรณ์ให้ครบทุก ${items.length} รายการ (ยังขาดอีก ${missingItems.length} รายการ)`);
  }

  if (missingReasonItems.length > 0) {
    errors.push(`มีอุปกรณ์ไม่พร้อมใช้งาน ${missingReasonItems.length} รายการ ที่ยังไม่ได้ระบุเหตุผล`);
  }

  const isValid = errors.length === 0 && missingItems.length === 0 && missingReasonItems.length === 0;

  return {
    isValid,
    errors,
    missingItems,
    missingReasonItems,
    summary: {
      total: items.length,
      readyCount: items.filter(i => i.status === 'READY').length,
      notReadyCount: items.filter(i => i.status === 'NOT_READY').length,
      uncheckedCount: items.filter(i => !i.status || i.status === 'NOT_CHECKED').length
    }
  };
}
