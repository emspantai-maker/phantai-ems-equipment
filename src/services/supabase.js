import { createClient } from '@supabase/supabase-js';
import { DEFAULT_EQUIPMENT_MASTER } from '../constants/defaultEquipment';
import { DEFAULT_VEHICLES } from '../constants/vehicles';
import { DEFAULT_USERS } from '../constants/seedUsers';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key-here' &&
  supabaseUrl.trim() !== ''
);

// Create real Supabase client if configured
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ============================================================================
// LOCAL / OFFLINE FALLBACK MOCK DATABASE ENGINE
// Provides 100% full functionality when Supabase is not connected yet,
// guaranteeing that the web app is immediately testable and operable!
// ============================================================================

const STORAGE_KEYS = {
  USERS: 'phantai_ems_users_v1',
  VEHICLES: 'phantai_ems_vehicles_v1',
  EQUIPMENT: 'phantai_ems_equipment_v1',
  INSPECTIONS: 'phantai_ems_inspections_v1',
  INSPECTION_ITEMS: 'phantai_ems_inspection_items_v1',
  AUDIT_LOGS: 'phantai_ems_audit_logs_v1',
  SESSION_USER: 'phantai_ems_active_session_v1',
  INSPECTION_DRAFT: 'phantai_ems_inspection_draft_v1'
};

// Initialize Mock Storage with Master Seed Data if empty
export function initLocalDatabase() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.VEHICLES)) {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(DEFAULT_VEHICLES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.EQUIPMENT)) {
    localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(DEFAULT_EQUIPMENT_MASTER));
  }
  if (!localStorage.getItem(STORAGE_KEYS.INSPECTIONS)) {
    localStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.INSPECTION_ITEMS)) {
    localStorage.setItem(STORAGE_KEYS.INSPECTION_ITEMS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([]));
  }
}

// Ensure database is initialized
initLocalDatabase();

export const localDb = {
  getUsers: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]'),
  saveUsers: (users) => localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users)),

  getVehicles: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.VEHICLES) || '[]'),
  saveVehicles: (vehicles) => localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles)),

  getEquipment: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.EQUIPMENT) || '[]'),
  saveEquipment: (eq) => localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(eq)),

  getInspections: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.INSPECTIONS) || '[]'),
  saveInspections: (inspections) => localStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify(inspections)),

  getInspectionItems: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.INSPECTION_ITEMS) || '[]'),
  saveInspectionItems: (items) => localStorage.setItem(STORAGE_KEYS.INSPECTION_ITEMS, JSON.stringify(items)),

  getAuditLogs: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS) || '[]'),
  saveAuditLogs: (logs) => localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs)),

  // Draft management
  getDraft: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.INSPECTION_DRAFT) || 'null'),
  saveDraft: (draft) => localStorage.setItem(STORAGE_KEYS.INSPECTION_DRAFT, JSON.stringify(draft)),
  clearDraft: () => localStorage.removeItem(STORAGE_KEYS.INSPECTION_DRAFT)
};
