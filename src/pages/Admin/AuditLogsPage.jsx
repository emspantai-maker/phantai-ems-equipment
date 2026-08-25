import React, { useState, useEffect } from 'react';
import { Shield, Search, RefreshCw, Clock, Filter, FileText } from 'lucide-react';
import { getAuditLogs } from '../../services/auditService';
import { formatThaiDate, formatThaiTime } from '../../utils/dateUtils';
import { useToast } from '../../context/ToastContext';

export default function AuditLogsPage() {
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterAction, setFilterAction] = useState('');
  const [filterTable, setFilterTable] = useState('');
  const [searchCode, setSearchCode] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await getAuditLogs({
        action: filterAction,
        tableName: filterTable,
        employeeCode: searchCode
      });
      setLogs(data);
    } catch (err) {
      toast.error('ไม่สามารถโหลดประวัติ Audit Log ได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [filterAction, filterTable]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadLogs();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-soft">
        <div>
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-ems-navy" />
            <span>ประวัติการตรวจสอบย้อนหลัง (System Audit Trail Logs)</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            บันทึกทุกกิจกรรมการเข้าใช้งาน การตรวจอุปกรณ์ การแก้ไขข้อมูล และการอนุมัติสิทธิ์ (Security Logs)
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-soft grid grid-cols-1 sm:grid-cols-3 gap-3">
        <form onSubmit={handleSearch} className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาตามรหัสพนักงาน..."
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white"
          />
        </form>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
        >
          <option value="">-- ทุกประเภท Action --</option>
          <option value="LOGIN">LOGIN (เข้าสู่ระบบ)</option>
          <option value="CREATE_INSPECTION">CREATE_INSPECTION (ตรวจอุปกรณ์)</option>
          <option value="REGISTER">REGISTER (สมัครสมาชิก)</option>
          <option value="APPROVE_USER">APPROVE_USER (อนุมัติสมาชิก)</option>
          <option value="REJECT_USER">REJECT_USER (ปฏิเสธสมาชิก)</option>
          <option value="CREATE_VEHICLE">CREATE_VEHICLE (เพิ่มรถ)</option>
          <option value="CREATE_EQUIPMENT">CREATE_EQUIPMENT (เพิ่มอุปกรณ์)</option>
        </select>

        <select
          value={filterTable}
          onChange={(e) => setFilterTable(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
        >
          <option value="">-- ทุกตาราง (All Tables) --</option>
          <option value="inspections">inspections</option>
          <option value="profiles">profiles</option>
          <option value="vehicles">vehicles</option>
          <option value="equipment">equipment</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            กำลังโหลดข้อมูล Audit Logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            ไม่พบบันทึก Audit Logs ตามเงื่อนไขที่กำหนด
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">วันและเวลา (Asia/Bangkok)</th>
                  <th className="py-3 px-4">ผู้ปฏิบัติการ (Inspector / User)</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">ตารางข้อมูล</th>
                  <th className="py-3 px-4">รายละเอียดข้อมูล</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    
                    {/* Timestamp */}
                    <td className="py-3 px-4 text-slate-800 whitespace-nowrap">
                      <div>{formatThaiDate(log.created_at?.split('T')[0])}</div>
                      <div className="text-[10px] text-slate-400">{formatThaiTime(log.created_at)}</div>
                    </td>

                    {/* Employee Code */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-ems-navy bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {log.employee_code || 'SYSTEM'}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        log.action?.includes('CREATE')
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.action?.includes('UPDATE') || log.action?.includes('APPROVE')
                          ? 'bg-blue-100 text-blue-800'
                          : log.action?.includes('DELETE') || log.action?.includes('REJECT')
                          ? 'bg-red-100 text-red-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {log.action}
                      </span>
                    </td>

                    {/* Table Name */}
                    <td className="py-3 px-4 text-slate-600 font-semibold">
                      {log.table_name}
                    </td>

                    {/* Details Payload */}
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {log.new_data ? JSON.stringify(log.new_data) : log.old_data ? JSON.stringify(log.old_data) : '-'}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
