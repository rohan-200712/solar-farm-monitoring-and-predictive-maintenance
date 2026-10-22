import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { SocketProvider } from './context/SocketContext.js';
import { Navbar } from './components/layout/Navbar.js';
import { Sidebar } from './components/layout/Sidebar.js';

// Pages
import { LandingPage } from './pages/LandingPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { SolarPanelsPage } from './pages/SolarPanelsPage.js';
import { PanelDetailsPage } from './pages/PanelDetailsPage.js';
import { InvertersPage } from './pages/InvertersPage.js';
import { InverterDetailsPage } from './pages/InverterDetailsPage.js';
import { WeatherPage } from './pages/WeatherPage.js';
import { AnalyticsPage } from './pages/AnalyticsPage.js';
import { HistoricalDataPage } from './pages/HistoricalDataPage.js';
import { AlertsPage } from './pages/AlertsPage.js';
import { MaintenancePage } from './pages/MaintenancePage.js';
import { ReportsPage } from './pages/ReportsPage.js';
import { UserManagementPage } from './pages/UserManagementPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { SettingsPage } from './pages/SettingsPage.js';

const MainLayout: React.FC = () => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const [activePage, setActivePage] = useState<string>('landing');
  const [selectedEntityId, setSelectedEntityId] = useState<string | undefined>(undefined);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sync with initial auth state
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && (activePage === 'landing' || activePage === 'login' || activePage === 'register')) {
        setActivePage('dashboard');
      } else if (!isAuthenticated && activePage !== 'landing' && activePage !== 'login' && activePage !== 'register') {
        setActivePage('landing');
      }
    }
  }, [isAuthenticated, isLoading]);

  const handleNavigate = (page: string, id?: string) => {
    setSelectedEntityId(id);
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs text-slate-400 font-mono">Initializing Solar SCADA Runtime...</p>
      </div>
    );
  }

  // Auth pages (no navbar or sidebar)
  if (!isAuthenticated) {
    if (activePage === 'login') {
      return <LoginPage onNavigate={handleNavigate} />;
    }
    if (activePage === 'register') {
      return <RegisterPage onNavigate={handleNavigate} />;
    }
    return <LandingPage onNavigate={handleNavigate} />;
  }

  // Render main portal view
  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      case 'panels':
        return <SolarPanelsPage onNavigate={handleNavigate} />;
      case 'panel-details':
        return <PanelDetailsPage panelId={selectedEntityId || 'PNL-01'} onNavigate={handleNavigate} />;
      case 'inverters':
        return <InvertersPage onNavigate={handleNavigate} />;
      case 'inverter-details':
        return <InverterDetailsPage inverterId={selectedEntityId || 'INV-01'} onNavigate={handleNavigate} />;
      case 'weather':
        return <WeatherPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'historical':
        return <HistoricalDataPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'maintenance':
        return <MaintenancePage />;
      case 'reports':
        return <ReportsPage />;
      case 'users':
        return role === 'admin' ? <UserManagementPage /> : <DashboardPage onNavigate={handleNavigate} />;
      case 'profile':
        return <ProfilePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activePage={activePage}
        onNavigate={handleNavigate}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onNavigate={handleNavigate}
          activePage={activePage}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <MainLayout />
      </SocketProvider>
    </AuthProvider>
  );
}
