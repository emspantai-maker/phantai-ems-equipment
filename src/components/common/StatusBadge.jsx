import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, CircleDashed } from 'lucide-react';

export default function StatusBadge({ status, size = 'md', showIcon = true, className = '' }) {
  let bg = 'bg-slate-100 text-slate-700 border-slate-300';
  let icon = <CircleDashed className="w-3.5 h-3.5 text-slate-500" />;
  let label = 'ยังไม่ได้ตรวจ';

  switch (status) {
    case 'READY':
    case 'COMPLETED':
    case 'PASSED':
      bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      label = 'พร้อมใช้งาน';
      break;

    case 'NOT_READY':
    case 'HAS_ISSUES':
    case 'FAILED':
      bg = 'bg-red-50 text-red-700 border-red-200';
      icon = <XCircle className="w-3.5 h-3.5 text-red-600" />;
      label = 'ไม่พร้อมใช้งาน';
      break;

    case 'NEEDS_CHECK':
    case 'WARNING':
      bg = 'bg-amber-50 text-amber-700 border-amber-200';
      icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
      label = 'ต้องตรวจสอบ';
      break;

    case 'NOT_CHECKED':
    default:
      bg = 'bg-slate-100 text-slate-600 border-slate-200';
      icon = <CircleDashed className="w-3.5 h-3.5 text-slate-400" />;
      label = 'ยังไม่ได้ตรวจ';
      break;
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3.5 py-1.5 text-sm font-semibold' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm ${bg} ${sizeClasses} ${className}`}>
      {showIcon && icon}
      <span>{label}</span>
    </span>
  );
}
