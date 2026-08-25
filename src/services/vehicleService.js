import { supabase, isSupabaseConfigured, localDb } from './supabase';
import { recordAuditLog } from './auditService';
import { DEFAULT_VEHICLES } from '../constants/vehicles';

/**
 * Fetch all vehicles (filtered by active status for general users, all for admin)
 */
export async function getVehicles(includeInactive = false) {
  if (isSupabaseConfigured) {
    let query = supabase.from('vehicles').select('*').order('vehicle_code', { ascending: true });
    if (!includeInactive) {
      query = query.eq('active', true);
    }
    const { data, error } = await query;
    if (!error && data && data.length > 0) return data;
  }

  let vehicles = localDb.getVehicles();
  if (vehicles.length === 0) {
    vehicles = DEFAULT_VEHICLES;
    localDb.saveVehicles(vehicles);
  }
  return includeInactive ? vehicles : vehicles.filter(v => v.active !== false);
}

/**
 * Admin: Add a new vehicle
 */
export async function addVehicle(vehicleData, currentUser) {
  const newVehicle = {
    id: `veh-${Date.now()}`,
    vehicle_code: vehicleData.vehicle_code || `AMB-${Date.now().toString().slice(-2)}`,
    vehicle_name: vehicleData.vehicle_name,
    license_plate: vehicleData.license_plate,
    description: vehicleData.description || '',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('vehicles').insert([newVehicle]).select().single();
      if (!error && data) {
        await recordAuditLog({
          userId: currentUser?.id,
          employeeCode: currentUser?.employee_code,
          action: 'CREATE_VEHICLE',
          tableName: 'vehicles',
          recordId: data.id,
          newData: data
        });
        return data;
      }
    } catch (err) {
      console.warn('Supabase vehicle insert error, using local storage:', err);
    }
  }

  const vehicles = localDb.getVehicles();
  // Check duplicate license plate
  if (vehicles.some(v => v.license_plate === newVehicle.license_plate && v.active)) {
    throw new Error(`ทะเบียน ${newVehicle.license_plate} มีอยู่ในระบบแล้ว`);
  }

  vehicles.push(newVehicle);
  localDb.saveVehicles(vehicles);

  await recordAuditLog({
    userId: currentUser?.id,
    employeeCode: currentUser?.employee_code,
    action: 'CREATE_VEHICLE',
    tableName: 'vehicles',
    recordId: newVehicle.id,
    newData: newVehicle
  });

  return newVehicle;
}

/**
 * Admin: Update vehicle
 */
export async function updateVehicle(id, updateData, currentUser) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('vehicles').update(updateData).eq('id', id).select().single();
      if (!error && data) {
        await recordAuditLog({
          userId: currentUser?.id,
          employeeCode: currentUser?.employee_code,
          action: 'UPDATE_VEHICLE',
          tableName: 'vehicles',
          recordId: id,
          newData: updateData
        });
        return data;
      }
    } catch (err) {
      console.warn('Supabase vehicle update error:', err);
    }
  }

  const vehicles = localDb.getVehicles();
  const idx = vehicles.findIndex(v => v.id === id);
  if (idx === -1) throw new Error('ไม่พบข้อมูลรถพยาบาล');

  const old = { ...vehicles[idx] };
  vehicles[idx] = { ...vehicles[idx], ...updateData, updated_at: new Date().toISOString() };
  localDb.saveVehicles(vehicles);

  await recordAuditLog({
    userId: currentUser?.id,
    employeeCode: currentUser?.employee_code,
    action: 'UPDATE_VEHICLE',
    tableName: 'vehicles',
    recordId: id,
    oldData: old,
    newData: updateData
  });

  return vehicles[idx];
}

/**
 * Admin: Soft Delete / Toggle Active Vehicle
 */
export async function toggleVehicleActive(id, currentUser) {
  const vehicles = localDb.getVehicles();
  const idx = vehicles.findIndex(v => v.id === id);
  if (idx === -1) throw new Error('ไม่พบข้อมูลรถพยาบาล');

  const newStatus = !vehicles[idx].active;
  vehicles[idx].active = newStatus;
  localDb.saveVehicles(vehicles);

  if (isSupabaseConfigured) {
    try {
      await supabase.from('vehicles').update({ active: newStatus }).eq('id', id);
    } catch {}
  }

  await recordAuditLog({
    userId: currentUser?.id,
    employeeCode: currentUser?.employee_code,
    action: newStatus ? 'ACTIVATE_VEHICLE' : 'SOFT_DELETE_VEHICLE',
    tableName: 'vehicles',
    recordId: id,
    newData: { active: newStatus }
  });

  return vehicles[idx];
}
