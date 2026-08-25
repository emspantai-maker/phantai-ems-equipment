import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, Shield, User, Search, RefreshCw, Check, X, ShieldAlert } from 'lucide-react';
import { getAllUsers, approveUser, rejectUser, toggleUserActive, updateUserByAdmin } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const list = await getAllUsers();
      setUsers(list);
    } catch (err) {
      toast.error('ไม่สามารถโหลดรายชื่อสมาชิกได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleApprove = async (userId) => {
    try {
      await approveUser(userId, currentUser);
      toast.success('อนุมัติสมาชิกสำเร็จ สมาชิกสามารถเข้าใช้งานได้ทันที');
      loadUsers();
    } catch (err) {
      toast.error('อนุมัติไม่สำเร็จ');
    }
  };

  const handleReject = async (userId) => {
    if (window.confirm('คุณต้องการปฏิเสธ/ระงับการใช้งานสมาชิกรายนี้ใช่หรือไม่?')) {
      try {
        await rejectUser(userId, currentUser);
        toast.warning('ปฏิเสธ/ระงับสมาชิกเรียบร้อย');
        loadUsers();
      } catch (err) {
        toast.error('ดำเนินการไม่สำเร็จ');
      }
    }
  };

  const handleToggleActive = async (userId) => {
    try {
      await toggleUserActive(userId, currentUser);
      toast.info('เปลี่ยนสถานะการใช้งานเรียบร้อย');
      loadUsers();
    } catch (err) {
      toast.error('ไม่สามารถเปลี่ยนสถานะได้');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserByAdmin(userId, { role: newRole }, currentUser);
      toast.success(`เปลี่ยนสิทธิ์เป็น ${newRole} สำเร็จ`);
      loadUsers();
    } catch (err) {
      toast.error('เปลี่ยนสิทธิ์ไม่สำเร็จ');
    }
  };

  const filtered = users.filter((u) => {
    const s = search.toLowerCase();
    const matchSearch =
      !s ||
      u.name?.toLowerCase().includes(s) ||
      u.employee_code?.toLowerCase().includes(s) ||
      u.username?.toLowerCase().includes(s);

    const matchRole = !filterRole || u.role === filterRole;

    return matchSearch && matchRole;
  });

  const pendingUsers = users.filter(u => !u.approved);

  return (
    <div className="space-y-6">
      
      {/* Pending Approvals Section (Requirement #32) */}
      {pendingUsers.length > 0 && (
        <div className="bg-amber-50 rounded-3xl p-5 border border-amber-300 shadow-soft space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <ShieldAlert className="w-5 h-5 text-amber-600 animate-pulse" />
            <span>มีสมาชิกใหม่รอการอนุมัติ ({pendingUsers.length} ท่าน)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingUsers.map((pu) => (
              <div
                key={pu.id}
                className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-extrabold text-sm text-slate-800">{pu.name}</div>
                  <div className="text-slate-500 font-medium mt-0.5">
                    รหัส: <strong className="text-amber-700">{pu.employee_code}</strong> | ตำแหน่ง: {pu.position}
                  </div>
                  <div className="text-[10px] text-slate-400">Username: {pu.username}</div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleApprove(pu.id)}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 active:scale-95 transition flex items-center gap-1 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>อนุมัติ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(pu.id)}
                    className="px-2.5 py-1.5 bg-slate-100 text-red-600 rounded-xl font-bold hover:bg-red-50 active:scale-95 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-soft flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาสมาชิกตามชื่อ, รหัสพนักงาน, username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-ems-primary"
          />
        </div>

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
        >
          <option value="">-- ทุกสิทธิ์การใช้งาน --</option>
          <option value="USER">เจ้าหน้าที่ (USER)</option>
          <option value="ADMIN">ผู้ดูแลระบบ (ADMIN)</option>
        </select>
      </div>

      {/* Users List Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">รหัส / ชื่อ-นามสกุล</th>
                <th className="py-3 px-4">ชื่อผู้ใช้ (Username)</th>
                <th className="py-3 px-4">ตำแหน่ง</th>
                <th className="py-3 px-4 text-center">สิทธิ์ (Role)</th>
                <th className="py-3 px-4 text-center">สถานะอนุมัติ</th>
                <th className="py-3 px-4 text-center">สถานะใช้งาน</th>
                <th className="py-3 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  
                  <td className="py-3 px-4">
                    <div className="font-extrabold text-slate-900">{u.name}</div>
                    <div className="text-[10px] text-blue-600 font-bold">รหัส {u.employee_code}</div>
                  </td>

                  <td className="py-3 px-4 text-slate-600">{u.username}</td>

                  <td className="py-3 px-4 font-semibold text-slate-700">{u.position}</td>

                  <td className="py-3 px-4 text-center">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold border ${
                        u.role === 'ADMIN' ? 'bg-amber-50 text-amber-900 border-amber-300' : 'bg-slate-50 text-slate-700 border-slate-300'
                      }`}
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>

                  <td className="py-3 px-4 text-center">
                    {u.approved ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        ✓ อนุมัติแล้ว
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        รออนุมัติ
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-center">
                    {u.active ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ปกติ
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                        ระงับ
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {!u.approved ? (
                        <button
                          type="button"
                          onClick={() => handleApprove(u.id)}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition"
                        >
                          อนุมัติ
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleActive(u.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                            u.active
                              ? 'bg-slate-100 hover:bg-red-50 text-red-600'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {u.active ? 'ระงับการใช้งาน' : 'เปิดใช้งาน'}
                        </button>
                      )}
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
