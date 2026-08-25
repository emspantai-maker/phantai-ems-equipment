import { supabase, isSupabaseConfigured, localDb } from './supabase';
import { recordAuditLog } from './auditService';
import { DEFAULT_EQUIPMENT_MASTER } from '../constants/defaultEquipment';

/**
 * Fetch equipment master list (ordered by equipment_no)
 */
export async function getEquipmentList(includeInactive = false) {
  if (isSupabaseConfigured) {
    let query = supabase.from('equipment').select('*').order('equipment_no', { ascending: true });
    if (!includeInactive) {
      query = query.eq('active', true);
    }
    const { data, error } = await query;
    if (!error && data && data.length > 0) return data;
  }

  let equipment = localDb.getEquipment();
  if (equipment.length === 0) {
    equipment = DEFAULT_EQUIPMENT_MASTER;
    localDb.saveEquipment(equipment);
  }
  return includeInactive ? equipment : equipment.filter(e => e.active !== false);
}

/**
 * Admin: Add new equipment item
 */
export async function addEquipment(equipmentData, currentUser) {
  const currentList = localDb.getEquipment();
  const nextNo = currentList.length > 0 ? Math.max(...currentList.map(e => e.equipment_no || 0)) + 1 : 1;

  const newEquipment = {
    id: `eq-${Date.now()}`,
    equipment_no: equipmentData.equipment_no || nextNo,
    equipment_name: equipmentData.equipment_name,
    category: equipmentData.category || 'GENERAL',
    category_code: equipmentData.category_code || 'GENERAL',
    minimum_quantity: parseInt(equipmentData.minimum_quantity, 10) || 1,
    unit: equipmentData.unit || 'ชิ้น',
    requirement: equipmentData.requirement || '',
    is_mandatory: Boolean(equipmentData.is_mandatory),
    is_quantitative: Boolean(equipmentData.is_quantitative),
    allow_bulk_ready: equipmentData.allow_bulk_ready !== false,
    check_type: equipmentData.check_type || 'NORMAL',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('equipment').insert([newEquipment]).select().single();
      if (!error && data) {
        await recordAuditLog({
          userId: currentUser?.id,
          employeeCode: currentUser?.employee_code,
          action: 'CREATE_EQUIPMENT',
          tableName: 'equipment',
          recordId: data.id,
          newData: data
        });
        return data;
      }
    } catch (err) {
      console.warn('Supabase equipment insert error:', err);
    }
  }

  currentList.push(newEquipment);
  localDb.saveEquipment(currentList);

  await recordAuditLog({
    userId: currentUser?.id,
    employeeCode: currentUser?.employee_code,
    action: 'CREATE_EQUIPMENT',
    tableName: 'equipment',
    recordId: newEquipment.id,
    newData: newEquipment
  });

  return newEquipment;
}

/**
 * Admin: Update equipment item
 */
export async function updateEquipment(id, updateData, currentUser) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('equipment').update(updateData).eq('id', id).select().single();
      if (!error && data) {
        await recordAuditLog({
          userId: currentUser?.id,
          employeeCode: currentUser?.employee_code,
          action: 'UPDATE_EQUIPMENT',
          tableName: 'equipment',
          recordId: id,
          newData: updateData
        });
        return data;
      }
    } catch (err) {
      console.warn('Supabase equipment update error:', err);
    }
  }

  const list = localDb.getEquipment();
  const idx = list.findIndex(e => e.id === id);
  if (idx === -1) throw new Error('ไม่พบข้อมูลอุปกรณ์');

  const old = { ...list[idx] };
  list[idx] = { ...list[idx], ...updateData, updated_at: new Date().toISOString() };
  localDb.saveEquipment(list);

  await recordAuditLog({
    userId: currentUser?.id,
    employeeCode: currentUser?.employee_code,
    action: 'UPDATE_EQUIPMENT',
    tableName: 'equipment',
    recordId: id,
    oldData: old,
    newData: updateData
  });

  return list[idx];
}

/**
 * Admin: Soft Delete / Toggle Active Equipment
 */
export async function toggleEquipmentActive(id, currentUser) {
  const list = localDb.getEquipment();
  const idx = list.findIndex(e => e.id === id);
  if (idx === -1) throw new Error('ไม่พบข้อมูลอุปกรณ์');

  const newStatus = !list[idx].active;
  list[idx].active = newStatus;
  localDb.saveEquipment(list);

  if (isSupabaseConfigured) {
    try {
      await supabase.from('equipment').update({ active: newStatus }).eq('id', id);
    } catch {}
  }

  await recordAuditLog({
    userId: currentUser?.id,
    employeeCode: currentUser?.employee_code,
    action: newStatus ? 'ACTIVATE_EQUIPMENT' : 'SOFT_DELETE_EQUIPMENT',
    tableName: 'equipment',
    recordId: id,
    newData: { active: newStatus }
  });

  return list[idx];
}
