import React from 'react';
import { useAuth } from '../../context/AuthContext.js';
import {
  LayoutDashboard,
  Grid,
  Cpu,
  CloudSun,
  LineChart,
  History,
  AlertTriangle,
  Wrench,
  FileText,
  Users,
  UserCheck,
  Settings,
  X,
  Flame,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activePage: string;
  onNavigate: (page: string, id?: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activePage,
  onNavigate,
}) => {
  const { role } = useAuth();

  const navigationItems = [
    { id: 'dashboard', label: 'Main Dashboard', icon: LayoutDashboard, category: 'Core' },
    { id: 'panels', label: 'Solar Panels', icon: Grid, category: 'Assets' },
    { id: 'inverters', label: 'Inverters', icon: Cpu, category: 'Assets' },
    { id: 'weather', label: 'Weather Monitoring', icon: CloudSun, category: 'Environment' },
    { id: 'analytics', label: 'Energy Analytics', icon: LineChart, category: 'Analytics' },
    { id: 'historical', label: 'Historical Data', icon: History, category: 'Analytics' },
    { id: 'alerts', label: 'Alerts & Events', icon: AlertTriangle, category: 'Operations', badge: 'Active' },
    { id: 'maintenance', label: 'Maintenance Hub', icon: Wrench, category: 'Operations' },
    { id: 'reports', label: 'Summary Reports', icon: FileText, category: 'Operations' },
    ...(role === 'admin'
      ? [{ id: 'users', label: 'User Management', icon: Users, category: 'Admin Only', adminOnly: true }]
      : []),
    { id: 'profile', label: 'Operator Profile', icon: UserCheck, category: 'Preferences' },
    { id: 'settings', label: 'System Settings', icon: Settings, category: 'Preferences' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      <aside
        id="sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950 text-slate-200 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:static`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-800/80 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black text-sm">
              <Flame className="w-4 h-4 text-slate-950 fill-slate-950" />
            </div>
            <div>
              <span className="font-mono font-bold text-sm text-white tracking-wider">SOLAR FARM</span>
              <span className="block text-[10px] text-amber-400 font-semibold tracking-tight">AI PREDICTIVE SYSTEM</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
          {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-slate-950 text-white' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.adminOnly && (
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-400/20 text-amber-300">
                    ADMIN
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User Role Card in Sidebar Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-400">Current Scope</span>
              <span className="font-mono text-amber-400 uppercase font-bold text-[10px]">
                {role || 'User'}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  role === 'admin' ? 'w-full bg-amber-400' : role === 'operator' ? 'w-2/3 bg-sky-400' : 'w-1/3 bg-emerald-400'
                }`}
              />
            </div>
            <div className="text-[10px] text-slate-500 mt-1.5">
              {role === 'admin'
                ? 'Full Control & User Management'
                : role === 'operator'
                ? 'Telemetry, Alerts & Maintenance Edit'
                : 'Read-only farm visibility'}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
