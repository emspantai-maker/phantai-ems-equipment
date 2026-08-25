import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { hasPendingDraft } from '../../services/offlineDraftService';

export default function OfflineBanner({ onSyncDraft }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasDraft, setHasDraft] = useState(() => hasPendingDraft());

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setHasDraft(hasPendingDraft());
    };
    const handleOffline = () => {
      setIsOnline(false);
      setHasDraft(hasPendingDraft());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(() => {
      setHasDraft(hasPendingDraft());
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (isOnline && !hasDraft) return null;

  return (
    <div className={`sticky top-0 z-40 px-4 py-2 text-xs md:text-sm font-medium flex items-center justify-between shadow-sm transition-all ${
      !isOnline
        ? 'bg-red-600 text-white'
        : 'bg-amber-500 text-white'
    }`}>
      <div className="flex items-center gap-2">
        {!isOnline ? (
          <>
            <WifiOff className="w-4 h-4 animate-pulse" />
            <span>คุณกำลังทำงานในโหมด <strong>Offline (ออฟไลน์)</strong> ข้อมูลจะถูกบันทึกเป็น Draft ในเครื่อง</span>
          </>
        ) : (
          <>
            <Wifi className="w-4 h-4" />
            <span>กลับมา <strong>Online</strong> แล้ว มีข้อมูลแบบร่าง (Draft) ที่ยังไม่ได้บันทึก</span>
          </>
        )}
      </div>

      {hasDraft && onSyncDraft && (
        <button
          onClick={onSyncDraft}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-white text-slate-800 rounded-lg text-xs font-bold shadow hover:bg-slate-50 transition active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>กู้คืนแบบร่าง</span>
        </button>
      )}
    </div>
  );
}
