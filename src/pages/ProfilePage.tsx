import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import {
  User,
  Shield,
  Key,
  Mail,
  Building,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, role } = useAuth();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const permissions = {
    admin: [
      'Full administrative access to all solar plant modules',
      'Create, edit, decommission solar panels and inverters',
      'User provisioning and role allocation (RBAC)',
      'Threshold alert configuration and overrides',
      'Executive report generation and audit certification',
    ],
    operator: [
      'Real-time SCADA telemetry monitoring and device drill-down',
      'Create and update maintenance tickets & technician assignments',
      'Acknowledge and resolve operational threshold alerts',
      'Export historical telemetry logs to CSV',
      'Trigger simulated diagnostics for testing',
    ],
    user: [
      'View plant key performance indicators and energy dashboards',
      'Monitor weather conditions and diurnal solar irradiance curves',
      'Read-only access to panel and inverter status lists',
      'Export summary reports',
    ],
  }[role || 'user'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          User Profile &amp; Role Credentials
        </h1>
        <p className="text-xs text-slate-500">
          Account information, department assignment, and platform capability scope
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-xl shadow-md">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'SG'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
              <span
                className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                  role === 'admin'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : role === 'operator'
                    ? 'bg-sky-50 text-sky-800 border-sky-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                {role}
              </span>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" />
              <span>{user?.email}</span>
              <span>•</span>
              <Building className="w-3.5 h-3.5" />
              <span>{user?.department || 'Operations'}</span>
            </div>
          </div>
        </div>

        {/* Assigned RBAC Capabilities */}
        <div className="pt-6 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Current Role Capabilities ({role?.toUpperCase()})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {permissions?.map((p, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2 text-xs text-slate-700"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
