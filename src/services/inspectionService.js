import { supabase, isSupabaseConfigured, localDb } from './supabase';
import { recordAuditLog } from './auditService';
import { getDaysInMonth, formatThaiDate } from '../utils/dateUtils';
import { validateInspectionSubmission } from '../utils/validationUtils';

/**
 * Check if inspection exists for vehicle + date + shift (Unique constraint check)
 */
export async function checkExistingInspection(vehicleId, dateStr, shift) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('inspections')
        .select('id, vehicle_id, inspection_date, shift, inspector_code, inspector_name, completed_at, overall_status')
        .eq('vehicle_id', vehicleId)
        .eq('inspection_date', dateStr)
        .eq('shift', shift)
        .maybeSingle();

      if (!error && data) return data;
    } catch (err) {
      console.warn('Supabase checkExisting error, checking local storage:', err);
    }
  }

  const inspections = localDb.getInspections();
  return inspections.find(
    i => (i.vehicle_id === vehicleId || i.vehicle?.id === vehicleId) &&
         i.inspection_date === dateStr &&
         i.shift === shift
  ) || null;
}

/**
 * Save Inspection with ALL 40 Items in a SINGLE BATCH OPERATION
 * กฎสำคัญ: ห้าม insert ทีละรายการ 40 ครั้ง ต้องทำแบบ Batch
 */
export async function saveInspectionBatch({
  vehicle,
  inspectionDate,
  shift,
  inspector,
  items,
  notes = '',
  startedAt
}) {
  // 1. Strict Validation
  const validation = validateInspectionSubmission({
    vehicleId: vehicle?.id,
    inspectionDate,
    shift,
    inspectorCode: inspector?.employee_code,
    items
  });

  if (!validation.isValid) {
    throw new Error(validation.errors.join(' | '));
  }

  // 2. Unique Constraint Check
  const existing = await checkExistingInspection(vehicle.id, inspectionDate, shift);
  if (existing) {
    throw new Error(`รถคันนี้มีการบันทึกผลการตรวจในวันที่ ${formatThaiDate(inspectionDate)} (${shift === 'MORNING' ? 'เวรเช้า' : 'เวรดึก'}) แล้ว`);
  }

  const dateParts = inspectionDate.split('-');
  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10);
  const completedAt = new Date().toISOString();

  const readyCount = items.filter(i => i.status === 'READY').length;
  const notReadyCount = items.filter(i => i.status === 'NOT_READY').length;
  const overallStatus = notReadyCount > 0 ? 'HAS_ISSUES' : 'COMPLETED';

  const inspectionId = `insp-${Date.now()}`;

  const inspectionHeader = {
    id: inspectionId,
    vehicle_id: vehicle.id,
    vehicle_license: vehicle.license_plate,
    vehicle_name: vehicle.vehicle_name,
    inspection_date: inspectionDate,
    inspection_month: month,
    inspection_year: year,
    shift,
    inspector_id: inspector?.id || null,
    inspector_code: inspector?.employee_code || '',
    inspector_name: inspector?.name || '',
    inspector_position: inspector?.position || '',
    started_at: startedAt || completedAt,
    completed_at: completedAt,
    overall_status: overallStatus,
    total_items: items.length,
    ready_items: readyCount,
    not_ready_items: notReadyCount,
    unchecked_items: 0,
    notes,
    created_at: completedAt,
    updated_at: completedAt
  };

  const batchItems = items.map((item, idx) => ({
    id: `item-${Date.now()}-${idx + 1}`,
    inspection_id: inspectionId,
    equipment_id: item.equipment_id,
    equipment_no: item.equipment_no,
    equipment_name: item.equipment_name,
    category: item.category,
    minimum_quantity: item.minimum_quantity,
    available_quantity: item.available_quantity !== null && item.available_quantity !== '' ? item.available_quantity : null,
    unit: item.unit,
    status: item.status,
    reason: item.reason || '',
    note: item.note || '',
    checked_at: item.checked_at || completedAt,
    created_at: completedAt,
    updated_at: completedAt
  }));

  // 3. Execute Batch Insert in Supabase or Local Storage
  if (isSupabaseConfigured) {
    try {
      // Insert Header
      const { error: headErr } = await supabase.from('inspections').insert([{
        id: inspectionHeader.id,
        vehicle_id: vehicle.id,
        inspection_date: inspectionDate,
        inspection_month: month,
        inspection_year: year,
        shift,
        inspector_id: inspector?.id,
        inspector_code: inspector?.employee_code,
        inspector_name: inspector?.name,
        started_at: inspectionHeader.started_at,
        completed_at: completedAt,
        overall_status: overallStatus,
        total_items: items.length,
        ready_items: readyCount,
        not_ready_items: notReadyCount,
        unchecked_items: 0,
        notes
      }]);

      if (headErr) throw headErr;

      // Batch Insert all 40 items in ONE call
      const { error: itemsErr } = await supabase.from('inspection_items').insert(
        batchItems.map(b => ({
          inspection_id: inspectionId,
          equipment_id: b.equipment_id,
          equipment_no: b.equipment_no,
          equipment_name: b.equipment_name,
          minimum_quantity: b.minimum_quantity,
          available_quantity: typeof b.available_quantity === 'number' ? b.available_quantity : (parseFloat(b.available_quantity) || null),
          status: b.status,
          reason: b.reason,
          note: b.note,
          checked_at: b.checked_at
        }))
      );

      if (itemsErr) throw itemsErr;
    } catch (err) {
      console.warn('Supabase Batch save error, writing to Local Storage:', err);
      // Fallback to local storage
      saveToLocalStorage(inspectionHeader, batchItems);
    }
  } else {
    saveToLocalStorage(inspectionHeader, batchItems);
  }

  // Clear local draft upon successful save
  localDb.clearDraft();

  // Record Audit Trail
  await recordAuditLog({
    userId: inspector?.id,
    employeeCode: inspector?.employee_code,
    action: 'CREATE_INSPECTION',
    tableName: 'inspections',
    recordId: inspectionId,
    newData: {
      vehicle: vehicle.license_plate,
      date: inspectionDate,
      shift,
      readyCount,
      notReadyCount
    }
  });

  return {
    success: true,
    inspection: inspectionHeader,
    items: batchItems
  };
}

function saveToLocalStorage(header, items) {
  const allInspections = localDb.getInspections();
  allInspections.unshift(header);
  localDb.saveInspections(allInspections);

  const allItems = localDb.getInspectionItems();
  localDb.saveInspectionItems([...items, ...allItems]);
}

/**
 * Fetch Inspections with flexible filters
 */
export async function getInspections(filters = {}) {
  let list = [];
  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('inspections')
        .select(`
          *,
          vehicles (id, vehicle_code, vehicle_name, license_plate)
        `)
        .order('inspection_date', { ascending: false })
        .order('completed_at', { ascending: false });

      if (filters.vehicleId) query = query.eq('vehicle_id', filters.vehicleId);
      if (filters.date) query = query.eq('inspection_date', filters.date);
      if (filters.month) query = query.eq('inspection_month', filters.month);
      if (filters.year) query = query.eq('inspection_year', filters.year);
      if (filters.shift) query = query.eq('shift', filters.shift);
      if (filters.inspectorCode) query = query.eq('inspector_code', filters.inspectorCode);
      if (filters.status) query = query.eq('overall_status', filters.status);

      const { data, error } = await query;
      if (!error && data) {
        list = data.map(d => ({
          ...d,
          vehicle: d.vehicles || { license_plate: d.vehicle_license || '', vehicle_name: d.vehicle_name || '' }
        }));
      }
    } catch (err) {
      console.warn('Supabase getInspections error, using local storage:', err);
    }
  }

  if (list.length === 0) {
    list = localDb.getInspections();
    const vehicles = localDb.getVehicles();

    // Attach vehicle details
    list = list.map(i => {
      const v = vehicles.find(veh => veh.id === i.vehicle_id) || {
        license_plate: i.vehicle_license || 'กข9745',
        vehicle_name: i.vehicle_name || 'รถพยาบาล'
      };
      return { ...i, vehicle: v };
    });

    if (filters.vehicleId) list = list.filter(i => i.vehicle_id === filters.vehicleId || i.vehicle?.id === filters.vehicleId);
    if (filters.date) list = list.filter(i => i.inspection_date === filters.date);
    if (filters.month) list = list.filter(i => i.inspection_month === parseInt(filters.month, 10));
    if (filters.year) list = list.filter(i => i.inspection_year === parseInt(filters.year, 10));
    if (filters.shift) list = list.filter(i => i.shift === filters.shift);
    if (filters.inspectorCode) list = list.filter(i => i.inspector_code?.includes(filters.inspectorCode));
    if (filters.status) list = list.filter(i => i.overall_status === filters.status);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(i =>
        i.vehicle?.license_plate?.toLowerCase().includes(s) ||
        i.inspector_name?.toLowerCase().includes(s) ||
        i.inspector_code?.toLowerCase().includes(s) ||
        i.inspection_date?.includes(s)
      );
    }
  }

  return list;
}

/**
 * Get Inspection Details with all 40 Items
 */
export async function getInspectionDetails(inspectionId) {
  if (isSupabaseConfigured) {
    try {
      const { data: header, error: headErr } = await supabase
        .from('inspections')
        .select('*, vehicles (*)')
        .eq('id', inspectionId)
        .single();

      if (!headErr && header) {
        const { data: items, error: itemsErr } = await supabase
          .from('inspection_items')
          .select('*')
          .eq('inspection_id', inspectionId)
          .order('equipment_no', { ascending: true });

        if (!itemsErr && items) {
          return {
            inspection: { ...header, vehicle: header.vehicles },
            items
          };
        }
      }
    } catch (err) {
      console.warn('Supabase getInspectionDetails error:', err);
    }
  }

  const allInspections = localDb.getInspections();
  const header = allInspections.find(i => i.id === inspectionId);
  if (!header) throw new Error('ไม่พบข้อมูลการตรวจสอบ');

  const allItems = localDb.getInspectionItems();
  const items = allItems
    .filter(it => it.inspection_id === inspectionId)
    .sort((a, b) => (a.equipment_no || 0) - (b.equipment_no || 0));

  const vehicles = localDb.getVehicles();
  const vehicle = vehicles.find(v => v.id === header.vehicle_id) || { license_plate: header.vehicle_license };

  return {
    inspection: { ...header, vehicle },
    items
  };
}

/**
 * Get Abnormal Items (รายการอุปกรณ์ไม่พร้อมใช้งาน) across history
 */
export async function getAbnormalItems(filters = {}) {
  const allInspections = await getInspections(filters);
  const abnormalList = [];

  const allItems = localDb.getInspectionItems();

  for (const insp of allInspections) {
    const inspItems = allItems.filter(it => it.inspection_id === insp.id && it.status === 'NOT_READY');
    for (const item of inspItems) {
      abnormalList.push({
        id: item.id,
        inspection_id: insp.id,
        vehicle_plate: insp.vehicle?.license_plate || insp.vehicle_license,
        vehicle_name: insp.vehicle?.vehicle_name,
        inspection_date: insp.inspection_date,
        shift: insp.shift,
        inspector_code: insp.inspector_code,
        inspector_name: insp.inspector_name,
        equipment_no: item.equipment_no,
        equipment_name: item.equipment_name,
        minimum_quantity: item.minimum_quantity,
        available_quantity: item.available_quantity,
        unit: item.unit,
        reason: item.reason,
        note: item.note,
        checked_at: item.checked_at || insp.completed_at
      });
    }
  }

  return abnormalList;
}

/**
 * Missing Inspections Auto-Detector
 * Identifies uninspected vehicles/shifts for a given date (default today)
 */
export async function getMissingInspections(targetDateStr) {
  const dateStr = targetDateStr || new Date().toISOString().split('T')[0];
  const vehicles = localDb.getVehicles().filter(v => v.active !== false);
  const inspections = await getInspections({ date: dateStr });

  const missingList = [];

  for (const vehicle of vehicles) {
    const morningCheck = inspections.find(i => (i.vehicle_id === vehicle.id || i.vehicle?.license_plate === vehicle.license_plate) && i.shift === 'MORNING');
    const nightCheck = inspections.find(i => (i.vehicle_id === vehicle.id || i.vehicle?.license_plate === vehicle.license_plate) && i.shift === 'NIGHT');

    if (!morningCheck) {
      missingList.push({
        vehicle,
        date: dateStr,
        shift: 'MORNING',
        shiftLabel: 'เวรเช้า',
        message: `${vehicle.license_plate} — เวรเช้า — ${formatThaiDate(dateStr)} — ยังไม่ได้ตรวจ`
      });
    }

    if (!nightCheck) {
      missingList.push({
        vehicle,
        date: dateStr,
        shift: 'NIGHT',
        shiftLabel: 'เวรดึก',
        message: `${vehicle.license_plate} — เวรดึก — ${formatThaiDate(dateStr)} — ยังไม่ได้ตรวจ`
      });
    }
  }

  return missingList;
}

/**
 * Generate 31-Day Monthly Inspection Matrix per Vehicle
 */
export async function getMonthlyMatrix(vehicleId, year, month) {
  const daysInMonth = getDaysInMonth(year, month);
  const monthInspections = await getInspections({
    vehicleId,
    year,
    month
  });

  const matrix = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    const morning = monthInspections.find(i => i.inspection_date === dayStr && i.shift === 'MORNING');
    const night = monthInspections.find(i => i.inspection_date === dayStr && i.shift === 'NIGHT');

    matrix.push({
      day,
      dateStr: dayStr,
      morning: morning ? {
        checked: true,
        inspector_code: morning.inspector_code,
        inspector_name: morning.inspector_name,
        time: morning.completed_at ? new Date(morning.completed_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '-',
        status: morning.overall_status,
        inspection_id: morning.id
      } : null,
      night: night ? {
        checked: true,
        inspector_code: night.inspector_code,
        inspector_name: night.inspector_name,
        time: night.completed_at ? new Date(night.completed_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '-',
        status: night.overall_status,
        inspection_id: night.id
      } : null
    });
  }

  return {
    year,
    month,
    daysInMonth,
    days: matrix,
    totalShifts: daysInMonth * 2,
    checkedShifts: matrix.reduce((acc, d) => acc + (d.morning ? 1 : 0) + (d.night ? 1 : 0), 0)
  };
}
