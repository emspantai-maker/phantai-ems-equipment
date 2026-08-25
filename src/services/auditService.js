import { supabase, isSupabaseConfigured, localDb } from './supabase';

/**
 * Record an audit log event
 */
export async function recordAuditLog({
  userId,
  employeeCode,
  action,
  tableName,
  recordId,
  oldData = null,
  newData = null
}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    user_id: userId || null,
    employee_code: employeeCode || 'SYSTEM',
    action,
    table_name: tableName,
    record_id: String(recordId || ''),
    old_data: oldData,
    new_data: newData,
    created_at: timestamp
  };

  try {
    if (isSupabaseConfigured) {
      await supabase.from('audit_logs').insert([{
        user_id: userId,
        employee_code: employeeCode,
        action,
        table_name: tableName,
        record_id: String(recordId),
        old_data: oldData,
        new_data: newData
      }]);
    } else {
      const logs = localDb.getAuditLogs();
      logs.unshift(logEntry);
      localDb.saveAuditLogs(logs.slice(0, 500)); // keep last 500 logs
    }
  } catch (err) {
    console.error('Failed to record audit log:', err);
  }

  return logEntry;
}

/**
 * Fetch all audit logs for Admin inspection
 */
export async function getAuditLogs(filters = {}) {
  if (isSupabaseConfigured) {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.action) query = query.eq('action', filters.action);
    if (filters.tableName) query = query.eq('table_name', filters.tableName);
    if (filters.employeeCode) query = query.eq('employee_code', filters.employeeCode);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } else {
    let logs = localDb.getAuditLogs();
    if (filters.action) {
      logs = logs.filter(l => l.action === filters.action);
    }
    if (filters.tableName) {
      logs = logs.filter(l => l.table_name === filters.tableName);
    }
    if (filters.employeeCode) {
      logs = logs.filter(l => l.employee_code?.toLowerCase().includes(filters.employeeCode.toLowerCase()));
    }
    return logs;
  }
}
