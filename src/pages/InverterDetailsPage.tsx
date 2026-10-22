import React, { useState, useEffect } from 'react';
import { invertersApi, readingsApi, alertsApi, maintenanceApi } from '../services/api.js';
import { Inverter, SensorReading, Alert, MaintenanceRecord, PredictiveRisk } from '../types/index.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import { RiskGauge } from '../components/common/RiskGauge.js';
import { LiveIndicator } from '../components/common/LiveIndicator.js';
import {
  ArrowLeft,
  Zap,
  Thermometer,
  Gauge,
  Clock,
  Activity,
  AlertTriangle,
  Wrench,
  Cpu,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface InverterDetailsPageProps {
  inverterId: string;
  onNavigate: (page: string, id?: string) => void;
}

export const InverterDetailsPage: React.FC<InverterDetailsPageProps> = ({
  inverterId,
  onNavigate,
}) => {
  const [inverter, setInverter] = useState<Inverter | null>(null);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [inverterAlerts, setInverterAlerts] = useState<Alert[]>([]);
  const [inverterMaintenance, setInverterMaintenance] = useState<MaintenanceRecord[]>([]);
  const [risk, setRisk] = useState<PredictiveRisk | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const res = await invertersApi.getById(inverterId);
        if (res.data.success) {
          const inv = res.data.data;
          setInverter(inv);
          setRisk(res.data.predictiveRisk);

          const [readsRes, alertsRes, maintRes] = await Promise.all([
            readingsApi.getByDevice(inv.inverterId),
            alertsApi.getAll({ deviceId: inv.inverterId }),
            maintenanceApi.getAll({ deviceId: inv.inverterId }),
          ]);

          if (readsRes.data.success) setReadings(readsRes.data.data);
          if (alertsRes.data.success) setInverterAlerts(alertsRes.data.data);
          if (maintRes.data.success) setInverterMaintenance(maintRes.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    if (inverterId) {
      loadData();
    }
  }, [inverterId]);

  if (isLoading) {
    return <div className="text-center py-24 text-slate-400 text-xs">Loading inverter diagnostics...</div>;
  }

  if (!inverter) {
    return (
      <div className="text-center py-24 text-slate-500 text-xs">
        Inverter not found.
        <button onClick={() => onNavigate('inverters')} className="ml-2 text-amber-600 underline">
          Return to inverters
        </button>
      </div>
    );
  }

  // Generate chart data
  const chartData = readings.length > 0
    ? readings.map(r => ({
        time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        power: r.power,
        voltage: r.voltage,
        temp: r.temperature,
        efficiency: r.efficiency,
      }))
    : [
        { time: '08:00', power: inverter.power * 0.4, temp: 42, efficiency: 97.5 },
        { time: '10:00', power: inverter.power * 0.75, temp: 48, efficiency: 98.1 },
        { time: '12:00', power: inverter.power, temp: inverter.temperature, efficiency: inverter.efficiency },
        { time: '14:00', power: inverter.power * 0.95, temp: inverter.temperature - 1, efficiency: inverter.efficiency },
        { time: '16:00', power: inverter.power * 0.6, temp: 44, efficiency: 97.9 },
      ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('inverters')}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 font-mono">{inverter.inverterId}</h1>
              <StatusBadge status={inverter.status} size="sm" />
              <LiveIndicator />
            </div>
            <p className="text-xs text-slate-500">
              {inverter.model} • Feeder Location: {inverter.location}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('maintenance')}
          className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Wrench className="w-3.5 h-3.5 text-amber-400" />
          Schedule Maintenance Work Order
        </button>
      </div>

      {/* Inverter KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[10px] font-semibold uppercase text-slate-400">Power Output</div>
          <div className="text-2xl font-bold font-mono text-amber-600 mt-1 flex items-baseline gap-1">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            {inverter.power} <span className="text-xs text-slate-500 font-normal">kW</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">AC Feeder Load</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[10px] font-semibold uppercase text-slate-400">Inverter Efficiency</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-1 flex items-baseline gap-1">
            <Gauge className="w-4 h-4 text-emerald-500" />
            {inverter.efficiency}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Euro CEC standard</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[10px] font-semibold uppercase text-slate-400">Core Temperature</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1 flex items-baseline gap-1">
            <Thermometer className={`w-4 h-4 ${inverter.temperature > 75 ? 'text-rose-500' : 'text-slate-500'}`} />
            {inverter.temperature}°C
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Throttle at: 80°C</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[10px] font-semibold uppercase text-slate-400">Operating Hours</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1 flex items-baseline gap-1">
            <Clock className="w-4 h-4 text-slate-400" />
            {inverter.operatingHours.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Lifetime runtime</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[10px] font-semibold uppercase text-slate-400">Total Yield</div>
          <div className="text-2xl font-bold font-mono text-sky-600 mt-1 flex items-baseline gap-1">
            <Activity className="w-4 h-4 text-sky-500" />
            {(inverter.totalEnergyGenerated / 1000).toFixed(1)} <span className="text-xs text-slate-500 font-normal">MWh</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Cumulative gen</div>
        </div>
      </div>

      {/* SECTION 11: Rule-Based Predictive Maintenance Health Analyzer */}
      {risk && <RiskGauge risk={risk} />}

      {/* Telemetry Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Active AC Generation Curve</h3>
          <p className="text-xs text-slate-500 mb-4">Output power (kW) over diurnal operational window</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="invPwr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} unit="kW" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="power" name="AC Feeder Output (kW)" stroke="#f59e0b" fill="url(#invPwr)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Core IGBT Temperature vs Efficiency</h3>
          <p className="text-xs text-slate-500 mb-4">Inverter thermal stress and conversion tracking</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#64748b' }} unit="°C" />
                <YAxis yAxisId="right" orientation="right" domain={[95, 100]} tick={{ fontSize: 10, fill: '#64748b' }} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line yAxisId="left" type="monotone" dataKey="temp" name="IGBT Core Temp (°C)" stroke="#ef4444" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="efficiency" name="Efficiency (%)" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-bold text-slate-900">Inverter Alert History</h3>
          </div>
          <div className="space-y-2">
            {inverterAlerts.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No active or past fault alarms for {inverter.inverterId}.
              </div>
            ) : (
              inverterAlerts.map(a => (
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

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Wrench className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900">Maintenance Activities</h3>
          </div>
          <div className="space-y-2">
            {inverterMaintenance.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No maintenance work orders recorded.
              </div>
            ) : (
              inverterMaintenance.map(m => (
                <div key={m._id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={m.status} size="sm" />
                      <span className="font-semibold text-slate-900">{m.problem}</span>
                    </div>
                    <p className="text-slate-600 mt-0.5">{m.description}</p>
                    <span className="text-[11px] text-slate-500">Tech: {m.technician}</span>
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
