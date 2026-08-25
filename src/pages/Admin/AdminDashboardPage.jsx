import React, { useState } from 'react';
import { ShieldCheck, Users, Ambulance, Layers, Shield, ArrowLeft } from 'lucide-react';
import UserManagementPage from './UserManagementPage';
import VehicleManagementPage from './VehicleManagementPage';
import EquipmentManagementPage from './EquipmentManagementPage';
import AuditLogsPage from './AuditLogsPage';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('users');

  const tabs = [
    { id: 'users', label: 'อนุมัติ & สมาชิก', icon: Users },
    { id: 'vehicles', label: 'จัดการรถพยาบาล', icon: Ambulance },
    { id: 'equipment', label: 'จัดการอุปกรณ์ Master', icon: Layers },
    { id: 'audit', label: 'ประวัติ Audit Logs', icon: Shield }
  ];

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-white shadow-sm">
            ADMINISTRATOR
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-amber-600" />
          <span>ระบบจัดการข้อมูลสำหรับผู้ดูแลระบบ (Admin Console)</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          หน่วยกู้ชีพเทศบาลเมืองพันท้ายนรสิงห์
        </p>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-ems-navy text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Content */}
      <div className="animate-in fade-in duration-150">
        {activeTab === 'users' && <UserManagementPage />}
        {activeTab === 'vehicles' && <VehicleManagementPage />}
        {activeTab === 'equipment' && <EquipmentManagementPage />}
        {activeTab === 'audit' && <AuditLogsPage />}
      </div>

    </div>
  );
}
