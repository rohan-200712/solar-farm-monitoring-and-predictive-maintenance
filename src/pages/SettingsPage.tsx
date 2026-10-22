import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import {
  Settings,
  Sliders,
  Database,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Save,
  RefreshCw,
  Cpu,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { role } = useAuth();
  const [saved, setSaved] = useState(false);

  // System parameters
  const [thresholds, setThresholds] = useState({
    panelTempLimit: 75,
    inverterTempLimit: 80,
    minEfficiencyLimit: 14.0,
    currentImbalanceLimit: 20,
    telemetryIntervalSeconds: 4,
    solarCoordinates: '35.0110° N, -115.4734° W (Mojave)',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          System Diagnostics &amp; Operational Thresholds
        </h1>
        <p className="text-xs text-slate-500">
          Tune automated alert triggers, predictive maintenance rules, and background simulation telemetry
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Operational thresholds updated and broadcast to all SCADA clients.</span>
        </div>
      )}

      {/* Threshold Configuration Form */}
      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
          <Sliders className="w-5 h-5 text-amber-500" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">Automated Alert Triggers &amp; Rule Thresholds</h2>
            <p className="text-xs text-slate-500">
              When real-time telemetry exceeds these thresholds, alerts and predictive risk scores escalate.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Panel Thermal Overheat Trigger (°C)
            </label>
            <input
              type="number"
              value={thresholds.panelTempLimit}
              disabled={role !== 'admin'}
              onChange={e => setThresholds({ ...thresholds, panelTempLimit: parseFloat(e.target.value) || 75 })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono disabled:opacity-60"
            />
            <p className="text-[11px] text-slate-400 mt-1">Default: 75°C. Generates critical thermal warning.</p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Inverter IGBT Thermal Trigger (°C)
            </label>
            <input
              type="number"
              value={thresholds.inverterTempLimit}
              disabled={role !== 'admin'}
              onChange={e => setThresholds({ ...thresholds, inverterTempLimit: parseFloat(e.target.value) || 80 })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono disabled:opacity-60"
            />
            <p className="text-[11px] text-slate-400 mt-1">Default: 80°C. Inverter trips cooling fans.</p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Minimum Module Efficiency Threshold (%)
            </label>
            <input
              type="number"
              step="0.5"
              value={thresholds.minEfficiencyLimit}
              disabled={role !== 'admin'}
              onChange={e => setThresholds({ ...thresholds, minEfficiencyLimit: parseFloat(e.target.value) || 14 })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono disabled:opacity-60"
            />
            <p className="text-[11px] text-slate-400 mt-1">Default: 14%. Flags module for dust/cleaning inspection.</p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Telemetry Simulation Cycle (Seconds)
            </label>
            <input
              type="number"
              value={thresholds.telemetryIntervalSeconds}
              disabled={role !== 'admin'}
              onChange={e => setThresholds({ ...thresholds, telemetryIntervalSeconds: parseInt(e.target.value) || 4 })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono disabled:opacity-60"
            />
            <p className="text-[11px] text-slate-400 mt-1">Socket.io broadcast interval for live dashboard sync.</p>
          </div>
        </div>

        {role === 'admin' ? (
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Apply Operational Thresholds</span>
            </button>
          </div>
        ) : (
          <div className="text-xs text-slate-400 italic">
            * Only Administrators can modify plant operational thresholds.
          </div>
        )}
      </form>

      {/* System Infrastructure Diagnostics */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
          <Database className="w-5 h-5 text-sky-500" />
          <h2 className="text-sm font-bold text-slate-900">System Runtime &amp; Storage Architecture</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="font-semibold text-slate-700">Database Engine</div>
            <div className="font-mono text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active Mongoose / Runtime DataStore
            </div>
            <p className="text-slate-500 text-[11px]">
              Seeded with 20 Solar Panels, 5 Inverters, 100+ Sensor Readings, Weather, Alerts &amp; Maintenance.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="font-semibold text-slate-700">Real-Time Telemetry Stream</div>
            <div className="font-mono text-amber-600 font-bold flex items-center gap-1">
              <Radio className="w-3.5 h-3.5" />
              Socket.io WebSockets (Port 3000)
            </div>
            <p className="text-slate-500 text-[11px]">
              Bidirectional event streaming with low-latency client state synchronization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
