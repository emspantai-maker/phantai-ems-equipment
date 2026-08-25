import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import BottomNav from './components/common/BottomNav';
import OfflineBanner from './components/common/OfflineBanner';

// Pages
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import FirstLoginPage from './pages/FirstLogin/FirstLoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import EquipmentCheckPage from './pages/EquipmentCheck/EquipmentCheckPage';
import HistoryPage from './pages/History/HistoryPage';
import StatisticsPage from './pages/Statistics/StatisticsPage';
import AbnormalItemsPage from './pages/AbnormalItems/AbnormalItemsPage';
import ProfilePage from './pages/Profile/ProfilePage';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';

export default function App() {
  const { user, loading, isAuthenticated, requiresFirstLoginPasswordChange } = useAuth();
  
  const [currentPath, setCurrentPath] = useState('/dashboard');
  const [targetInspectionVehicle, setTargetInspectionVehicle] = useState(null);
  const [targetInspectionShift, setTargetInspectionShift] = useState(null);

  const navigate = (path) => {
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartInspection = (vehicle, shift = null) => {
    setTargetInspectionVehicle(vehicle);
    setTargetInspectionShift(shift);
    navigate('/check');
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-white/10 p-2 flex items-center justify-center border border-white/20 animate-pulse">
          <img src="/icons/logo-ems.svg" alt="EMS Logo" className="w-12 h-12 object-contain" />
        </div>
        <div className="text-sm font-bold text-slate-300">กำลังโหลดระบบตรวจสอบอุปกรณ์...</div>
      </div>
    );
  }

  // First Login Password Change Gate (Requirement #30)
  if (requiresFirstLoginPasswordChange) {
    return <FirstLoginPage />;
  }

  // Not Logged In / Registration Gate (Requirement #33, 34)
  if (!isAuthenticated) {
    if (currentPath === '/register') {
      return <RegisterPage onNavigate={navigate} />;
    }
    return <LoginPage onNavigate={navigate} />;
  }

  // Main Authenticated Application Layout
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-ems-primary selection:text-white">
      
      {/* Offline Draft Banner */}
      <OfflineBanner onSyncDraft={() => navigate('/check')} />

      {/* Main Navbar */}
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* Desktop Sidebar (Requirement #4) */}
        <Sidebar currentPath={currentPath} onNavigate={navigate} />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full overflow-x-hidden">
          {currentPath === '/dashboard' && (
            <DashboardPage
              onNavigate={navigate}
              onStartInspectionWithVehicle={handleStartInspection}
            />
          )}

          {currentPath === '/check' && (
            <EquipmentCheckPage
              initialVehicle={targetInspectionVehicle}
              initialShift={targetInspectionShift}
              onNavigate={navigate}
            />
          )}

          {currentPath === '/history' && <HistoryPage />}

          {currentPath === '/statistics' && <StatisticsPage />}

          {currentPath === '/abnormal' && <AbnormalItemsPage />}

          {currentPath === '/profile' && <ProfilePage />}

          {currentPath === '/admin' && <AdminDashboardPage />}
        </main>

      </div>

      {/* Mobile Bottom Navigation (Requirement #4, 60) */}
      <BottomNav currentPath={currentPath} onNavigate={navigate} />

    </div>
  );
}
