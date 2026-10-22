import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useSocket } from '../../context/SocketContext.js';
import { LiveIndicator } from '../common/LiveIndicator.js';
import {
  Sun,
  Bell,
  LogOut,
  User,
  Shield,
  Zap,
  Menu,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  onNavigate: (page: string, id?: string) => void;
  activePage: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onNavigate,
}) => {
  const { user, logout, role, demoLogin } = useAuth();
  const { liveData, lastAlert } = useSocket();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Left Side: Mobile toggle + Brand Title */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-sidebar-toggle"
            onClick={onToggleSidebar}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg lg:hidden cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
                SOLARGUARD <span className="text-[10px] font-mono px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-semibold">FSD MERN</span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Predictive Maintenance & Monitoring</p>
            </div>
          </div>
        </div>

        {/* Center: Live Telemetry telemetry pill */}
        <div className="hidden md:flex items-center gap-4">
          <LiveIndicator />

          <div className="flex items-center gap-3 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs">
            <span className="flex items-center gap-1 text-slate-600">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Generation:</span>
              <span className="font-mono font-bold text-slate-900">
                {liveData?.totalGenerationKw ?? 395.2} kW
              </span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 text-slate-600">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>GHI:</span>
              <span className="font-mono font-bold text-slate-900">
                {liveData?.irradiance ?? 890} W/m²
              </span>
            </span>
          </div>
        </div>

        {/* Right Side: Quick Role Switcher, Alert Bell, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Demo Role Switcher for college examiners */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 cursor-pointer transition-colors"
              title="Switch demo role instantly for presentation"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Role: <span className="capitalize underline">{role || 'user'}</span></span>
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase">
                  Instant Demo Switch
                </div>
                {(['admin', 'operator', 'user'] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => {
                      demoLogin(r);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-amber-50 cursor-pointer ${
                      role === r ? 'font-bold text-amber-900 bg-amber-50/60' : 'text-slate-700'
                    }`}
                  >
                    <span className="capitalize">{r === 'user' ? 'User / Viewer' : r}</span>
                    {role === r && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Alert Notification Button */}
          <button
            onClick={() => onNavigate('alerts')}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
            title="Active System Alerts"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer border border-transparent hover:border-slate-200 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'SG'}
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[110px]">
                  {user?.name || 'Operator'}
                </div>
                <div className="text-[10px] font-mono text-slate-500 capitalize flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5 text-amber-500" />
                  {role || 'User'}
                </div>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  <span className="mt-1 inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-amber-100 text-amber-800">
                    Role: {role}
                  </span>
                </div>

                <button
                  onClick={() => {
                    onNavigate('profile');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  Profile Details
                </button>

                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                    onNavigate('landing');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer border-t border-slate-100 mt-1"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
