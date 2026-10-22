import React, { useState, useEffect } from 'react';
import { panelsApi, readingsApi, alertsApi, maintenanceApi } from '../services/api.js';
import { SolarPanel, SensorReading, Alert, MaintenanceRecord, PredictiveRisk } from '../types/index.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import { RiskGauge } from '../components/common/RiskGauge.js';
import { LiveIndicator } from '../components/common/LiveIndicator.js';
import {
  ArrowLeft,
  Zap,
  Thermometer,
  Gauge,
  Activity,
  Calendar,
  AlertTriangle,
  Wrench,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

interface PanelDetailsPageProps {
  panelId: string;
  onNavigate: (page: string, id?: string) => void;
}

export const PanelDetailsPage: React.FC<PanelDetailsPageProps> = ({ panelId, onNavigate }) => {
  const [panel, setPanel] = useState<SolarPanel | null>(null);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [panelAlerts, setPanelAlerts] = useState<Alert[]>([]);
  const [panelMaintenance, setPanelMaintenance] = useState<MaintenanceRecord[]>([]);
  const [risk, setRisk] = useState<PredictiveRisk | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const res = await panelsApi.getById(panelId);
        if (res.data.success) {
          const p = res.data.data;
          setPanel(p);
          setRisk(res.data.predictiveRisk);

          // Fetch historical sensor readings for this panel
          const [readsRes, alertsRes, maintRes] = await Promise.all([
            readingsApi.getByDevice(p.panelId),
            alertsApi.getAll({ deviceId: p.panelId }),
            maintenanceApi.getAll({ deviceId: p.panelId }),
          ]);

          if (readsRes.data.success) setReadings(readsRes.data.data);
          if (alertsRes.data.success) setPanelAlerts(alertsRes.data.data);
          if (maintRes.data.success) setPanelMaintenance(maintRes.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    if (panelId) {
      loadData();
    }
  }, [panelId]);

  if (isLoading) {
    return <div className="text-center py-24 text-slate-400 text-xs">Loading panel telemetry diagnostics...</div>;
  }

  if (!panel) {
    return (
      <div className="text-center py-24 text-slate-500 text-xs">
        Panel not found.
        <button onClick={() => onNavigate('panels')} className="ml-2 text-amber-600 underline">
          Return to panels
        </button>
      </div>
    );
  }

  // Format readings for chart
  const chartData = readings.map(r => ({
    time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    power: r.power,
    voltage: r.voltage,
    current: r.current,
    temp: r.temperature,
    efficiency: r.efficiency,
  }));

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('panels')}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 font-mono">{panel.panelId}</h1>
              <StatusBadge status={panel.status} size="sm" />
              <LiveIndicator />
            </div>
            <p className="text-xs text-slate-500">{panel.name} • Location: {panel.location}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('maintenance')}
            className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            Schedule Work Order
          </button>
        </div>
      </div>

      {/* Real-time Telemetry Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[10px] font-semibold uppercase text-slate-400">Current Output</div>
          <div className="text-2xl font-bold font-mono text-amber-600 mt-1 flex items-baseline gap-1">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            {panel.power} <span className="text-xs text-slate-500 font-normal">W</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Instantaneous PV</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[10px] font-semibold uppercase text-slate-400">Conversion Efficiency</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-1 flex items-baseline gap-1">
            <Gauge className="w-4 h-4 text-emerald-500" />
            {panel.efficiency}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Rated 20.8%</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[10px] font-semibold uppercase text-slate-400">DC Voltage</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {panel.voltage} <span className="text-xs text-slate-500 font-normal">V</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">String bus potential</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[10px] font-semibold uppercase text-slate-400">DC Current</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {panel.current} <span className="text-xs text-slate-500 font-normal">A</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Imp standard: 8.8A</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[10px] font-semibold uppercase text-slate-400">Cell Temperature</div>
          <div className="text-2xl font-bold font-mono text-rose-600 mt-1 flex items-baseline gap-1">
            <Thermometer className="w-4 h-4 text-rose-500" />
            {panel.temperature}°C
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Threshold: 75°C</div>
        </div>
      </div>

      {/* Predictive Failure Risk Analyzer Box (Section 11 requirement) */}
      {risk && <RiskGauge risk={risk} />}

      {/* Historical Telemetry Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Power & Efficiency */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Power Output &amp; Efficiency Trend</h3>
          <p className="text-xs text-slate-500 mb-4">Historical sensor samples for {panel.panelId}</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="pnlPwr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#64748b' }} unit="W" />
                <YAxis yAxisId="right" orientation="right" domain={[10, 25]} tick={{ fontSize: 10, fill: '#64748b' }} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area yAxisId="left" type="monotone" dataKey="power" name="Power Output (W)" stroke="#f59e0b" fill="url(#pnlPwr)" />
                <Line yAxisId="right" type="monotone" dataKey="efficiency" name="Efficiency (%)" stroke="#10b981" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Temperature & Voltage */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Thermal &amp; Voltage Drift</h3>
          <p className="text-xs text-slate-500 mb-4">Temperature derating impact on string potential</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#64748b' }} unit="°C" />
                <YAxis yAxisId="right" orientation="right" domain={[20, 60]} tick={{ fontSize: 10, fill: '#64748b' }} unit="V" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line yAxisId="left" type="monotone" dataKey="temp" name="Junction Temp (°C)" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="voltage" name="DC Voltage (V)" stroke="#3b82f6" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Fault & Maintenance History Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fault History */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-bold text-slate-900">Device Alert &amp; Fault History</h3>
          </div>

          <div className="space-y-2">
            {panelAlerts.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No active or historical faults recorded for {panel.panelId}.
              </div>
            ) : (
              panelAlerts.map(a => (
                <div key={a._id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={a.severity} size="sm" />
                      <span className="font-semibold text-slate-900">{a.type}</span>
                    </div>
                    <p className="text-slate-600 mt-0.5">{a.message}</p>
                  </div>
                  <div className="text-right text-[11px] text-slate-400 font-mono">
                    {new Date(a.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Maintenance History */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Wrench className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900">Device Maintenance Records</h3>
          </div>

          <div className="space-y-2">
            {panelMaintenance.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No maintenance work orders for {panel.panelId}.
              </div>
            ) : (
              panelMaintenance.map(m => (
                <div key={m._id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={m.status} size="sm" />
                      <span className="font-semibold text-slate-900">{m.problem}</span>
                    </div>
                    <p className="text-slate-600 mt-0.5">{m.description}</p>
                    <span className="text-[11px] text-slate-500">Technician: {m.technician}</span>
                  </div>
                  <div className="text-right text-[11px] text-slate-400 font-mono">
                    {m.scheduledDate}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
