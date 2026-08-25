import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';
import { getFormattedLiveDateTime } from '../../utils/dateUtils';

export default function LiveClock({ showDate = true, showIcon = true, className = '' }) {
  const [timeData, setTimeData] = useState(() => getFormattedLiveDateTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeData(getFormattedLiveDateTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`flex flex-wrap items-center gap-2 text-xs md:text-sm font-medium ${className}`}>
      {showDate && (
        <div className="flex items-center gap-1.5 text-slate-700 bg-white/80 backdrop-blur px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm">
          {showIcon && <Calendar className="w-3.5 h-3.5 text-ems-primary" />}
          <span>{timeData.fullDateText}</span>
        </div>
      )}
      <div className="flex items-center gap-1.5 font-semibold text-ems-navy bg-white/80 backdrop-blur px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm">
        {showIcon && <Clock className="w-3.5 h-3.5 text-ems-red animate-pulse" />}
        <span className="tabular-nums tracking-wide">{timeData.timeText}</span>
      </div>
    </div>
  );
}
