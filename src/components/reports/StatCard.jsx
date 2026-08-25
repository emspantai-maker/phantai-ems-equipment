import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  onClick
}) {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50/80',
      border: 'border-blue-200',
      text: 'text-ems-navy',
      iconBg: 'bg-blue-500',
      iconText: 'text-white'
    },
    emerald: {
      bg: 'bg-emerald-50/80',
      border: 'border-emerald-200',
      text: 'text-emerald-900',
      iconBg: 'bg-emerald-600',
      iconText: 'text-white'
    },
    red: {
      bg: 'bg-red-50/80',
      border: 'border-red-200',
      text: 'text-red-900',
      iconBg: 'bg-red-600',
      iconText: 'text-white'
    },
    amber: {
      bg: 'bg-amber-50/80',
      border: 'border-amber-200',
      text: 'text-amber-900',
      iconBg: 'bg-amber-500',
      iconText: 'text-white'
    },
    slate: {
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      text: 'text-slate-900',
      iconBg: 'bg-slate-600',
      iconText: 'text-white'
    }
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-4 sm:p-5 border ${scheme.bg} ${scheme.border} shadow-soft flex items-center justify-between transition-all ${
        onClick ? 'cursor-pointer hover:shadow-card hover:-translate-y-0.5 active:scale-98' : ''
      }`}
    >
      <div>
        <span className="text-xs font-bold text-slate-500 block mb-1">
          {title}
        </span>
        <div className={`text-2xl sm:text-3xl font-black ${scheme.text} tabular-nums leading-tight`}>
          {value}
        </div>
        {subtitle && (
          <span className="text-[11px] font-medium text-slate-500 mt-1 block">
            {subtitle}
          </span>
        )}
      </div>

      {Icon && (
        <div className={`w-12 h-12 rounded-2xl ${scheme.iconBg} ${scheme.iconText} flex items-center justify-center shadow-md flex-shrink-0 ml-3`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
}
