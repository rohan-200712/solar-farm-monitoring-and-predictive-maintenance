import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext.js';
import { analyticsApi, alertsApi, maintenanceApi, weatherApi } from '../services/api.js';
import { DashboardKPIs, Alert, MaintenanceRecord } from '../types/index.js';
import { StatCard } from '../components/common/StatCard.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import { LiveIndicator } from '../components/common/LiveIndicator.js';
import {
  Sun,
  Zap,
  Grid,
  Cpu,
  AlertTriangle,
  Wrench,
  Thermometer,
  Gauge,
  CloudSun,
  Activity,
  Flame,
  ArrowUpRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface DashboardPageProps {
  onNavigate: (page: string, id?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { liveData, isConnected, triggerDemoSpike } = useSocket();
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [charts, setCharts] = useState<any>(null);
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [pendingMaintenance, setPendingMaintenance] = useState<MaintenanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [spikeLoading, setSpikeLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [sumRes, alertsRes, maintRes] = await Promise.all([
        analyticsApi.getSummary(),
        alertsApi.getAll({ status: 'Active' }),
        maintenanceApi.getAll({ status: 'Scheduled' }),
      ]);

      if (sumRes.data.success) {
        setKpis(sumRes.data.kpis);
        setCharts(sumRes.data.charts);
      }
      if (alertsRes.data.success) {
        setActiveAlerts(alertsRes.data.data.slice(0, 4));
      }
      if (maintRes.data.success) {
        setPendingMaintenance(maintRes.data.data.slice(0, 4));
      }
    } catch (err) {
      console.error('Failed to load dashboard summary', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Incorporate real-time Socket.io updates into KPIs without screen refresh
  const currentGen = liveData?.totalGenerationKw ?? kpis?.currentGenerationKw ?? 395.2;
  const currentIrr = liveData?.irradiance ?? kpis?.solarIrradiance ?? 890;
  const activePanels = liveData?.activePanelsCount ?? kpis?.activePanels ?? 16;
  const faultyPanels = liveData?.faultyPanelsCount ?? kpis?.faultyPanels ?? 4;
  const onlineInverters = liveData?.onlineInvertersCount ?? kpis?.onlineInverters ?? 4;

  const handleSimulateSpike = async (type: 'heat' | 'fault') => {
    setSpikeLoading(true);
    await triggerDemoSpike(type === 'heat' ? 'INV-03' : 'PNL-04', type);
    await fetchDashboardData();
    setSpikeLoading(false);
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await alertsApi.update(alertId, { status: 'Resolved' });
      setActiveAlerts(prev => prev.filter(a => a._id !== alertId && a.alertId !== alertId));
      if (kpis) {
        setKpis({ ...kpis, activeAlerts: Math.max(0, kpis.activeAlerts - 1) });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Real-time Live Status & Demonstration Controls */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 sm:p-6 rounded-2xl border border-slate-700 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                SCADA TELEMETRY HUB
              </span>
              <LiveIndicator />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Solar Farm Central Monitoring Dashboard
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Grid-connected photovoltaic array operating in Mojave Solar District 4 • Real-time inverter &amp; panel telemetry
            </p>
          </div>

          {/* Demonstration Quick Actions for Examiners */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSimulateSpike('heat')}
              disabled={spikeLoading}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
              title="Simulate inverter thermal throttle event to test predictive alerts"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Simulate Heat Spike</span>
            </button>
            <button
              onClick={() => handleSimulateSpike('fault')}
              disabled={spikeLoading}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
              title="Simulate panel diode collapse"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Simulate Fault</span>
            </button>
            <button
              onClick={fetchDashboardData}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Refresh Telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 5: All 15 Primary KPI Counters */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Plant Key Performance Indicators (15 Metrics)
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">
            Auto-syncing every 4 seconds
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* 1. Total Panels */}
          <StatCard
            id="kpi-total-panels"
            title="Total Panels"
            value={kpis?.totalPanels ?? 20}
            unit="Modules"
            subtitle="4 Field Strings"
            icon={Grid}
            variant="slate"
            onClick={() => onNavigate('panels')}
          />

          {/* 2. Active Panels */}
          <StatCard
            id="kpi-active-panels"
            title="Active Panels"
            value={activePanels}
            unit="Healthy"
            subtitle="Producing standard yield"
            icon={Grid}
            variant="emerald"
            badge={<StatusBadge status="Normal" size="sm" />}
            onClick={() => onNavigate('panels')}
          />

          {/* 3. Faulty Panels */}
          <StatCard
            id="kpi-faulty-panels"
            title="Faulty Panels"
            value={faultyPanels}
            unit="Flagged"
            subtitle="Need cleaning / inspection"
            icon={AlertTriangle}
            variant="rose"
            badge={<StatusBadge status="Fault" size="sm" />}
            onClick={() => onNavigate('panels')}
          />

          {/* 4. Total Inverters */}
          <StatCard
            id="kpi-total-inverters"
            title="Total Inverters"
            value={kpis?.totalInverters ?? 5}
            unit="Stations"
            subtitle="Central 400V 3-Phase"
            icon={Cpu}
            variant="slate"
            onClick={() => onNavigate('inverters')}
          />

          {/* 5. Online Inverters */}
          <StatCard
            id="kpi-online-inverters"
            title="Online Inverters"
            value={onlineInverters}
            unit="Online"
            subtitle="Synced to grid feeder"
            icon={Cpu}
            variant="emerald"
            badge={<StatusBadge status="Online" size="sm" />}
            onClick={() => onNavigate('inverters')}
          />

          {/* 6. Offline Inverters */}
          <StatCard
            id="kpi-offline-inverters"
            title="Offline Inverters"
            value={kpis?.offlineInverters ?? 1}
            unit="Offline"
            subtitle="INV-05 Auxiliary Trip"
            icon={Cpu}
            variant="amber"
            badge={<StatusBadge status="Offline" size="sm" />}
            onClick={() => onNavigate('inverters')}
          />

          {/* 7. Current Energy Generation */}
          <StatCard
            id="kpi-current-generation"
            title="Current Generation"
            value={currentGen}
            unit="kW"
            subtitle="Instantaneous Farm Output"
            icon={Zap}
            variant="amber"
            trend={{ value: '12.4%', isPositive: true }}
            onClick={() => onNavigate('analytics')}
          />

          {/* 8. Daily Energy Production */}
          <StatCard
            id="kpi-daily-production"
            title="Daily Production"
            value={kpis?.dailyProductionKwh ?? 2450}
            unit="kWh"
            subtitle="Today's Cumulative Energy"
            icon={Activity}
            variant="blue"
            trend={{ value: '4.8%', isPositive: true }}
            onClick={() => onNavigate('historical')}
          />

          {/* 9. Monthly Energy Production */}
          <StatCard
            id="kpi-monthly-production"
            title="Monthly Energy"
            value={kpis?.monthlyProductionMwh ?? 72.8}
            unit="MWh"
            subtitle="MTD Farm Generation"
            icon={Activity}
            variant="slate"
            trend={{ value: '6.1%', isPositive: true }}
            onClick={() => onNavigate('reports')}
          />

          {/* 10. Average Panel Efficiency */}
          <StatCard
            id="kpi-avg-efficiency"
            title="Avg Panel Efficiency"
            value={kpis?.avgEfficiency ?? 20.2}
            unit="%"
            subtitle="Rated: 20.8% Bifacial"
            icon={Gauge}
            variant="emerald"
            onClick={() => onNavigate('panels')}
          />

          {/* 11. Current Temperature */}
          <StatCard
            id="kpi-temperature"
            title="Ambient Temp"
            value={kpis?.currentTemperature ?? 28.4}
            unit="°C"
            subtitle="Array surface: ~42°C"
            icon={Thermometer}
            variant="slate"
            onClick={() => onNavigate('weather')}
          />

          {/* 12. Solar Irradiance */}
          <StatCard
            id="kpi-irradiance"
            title="Solar Irradiance"
            value={currentIrr}
            unit="W/m²"
            subtitle="Global Horizontal (GHI)"
            icon={Sun}
            variant="amber"
            onClick={() => onNavigate('weather')}
          />

          {/* 13. Weather Condition */}
          <StatCard
            id="kpi-weather"
            title="Atmosphere"
            value={kpis?.weatherCondition ?? 'Sunny'}
            unit="Clear"
            subtitle="OpenWeather Realtime"
            icon={CloudSun}
            variant="blue"
            onClick={() => onNavigate('weather')}
          />

          {/* 14. Active Alerts */}
          <StatCard
            id="kpi-active-alerts"
            title="Active Alerts"
            value={activeAlerts.length}
            unit="Incidents"
            subtitle="Auto Threshold Triggers"
            icon={AlertTriangle}
            variant={activeAlerts.length > 0 ? 'rose' : 'emerald'}
            onClick={() => onNavigate('alerts')}
          />

          {/* 15. Pending Maintenance */}
          <StatCard
            id="kpi-pending-maintenance"
            title="Pending Maintenance"
            value={pendingMaintenance.length}
            unit="Scheduled"
            subtitle="Assigned technicians"
            icon={Wrench}
            variant="amber"
            onClick={() => onNavigate('maintenance')}
          />
        </div>
      </div>

      {/* SECTION 5: 6 Recharts Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GRAPH 1: Energy Generation Graph (Hourly today generation + Irradiance) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Diurnal Energy Generation &amp; Solar Irradiance</h3>
              <p className="text-xs text-slate-500">Hourly photovoltaic output (kW) vs Sun Radiation (W/m²)</p>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-0.5 cursor-pointer"
            >
              Analytics <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.hourlyGeneration || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorIrr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} unit="kW" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748b' }} unit="W" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area yAxisId="left" type="monotone" dataKey="generation" name="Power Output (kW)" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorGen)" />
                <Area yAxisId="right" type="monotone" dataKey="irradiance" name="Irradiance (W/m²)" stroke="#0284c7" strokeWidth={1.5} fillOpacity={1} fill="url(#colorIrr)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRAPH 2: Panel Strings Efficiency Graph */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Array String Efficiency Comparison</h3>
              <p className="text-xs text-slate-500">Average operational efficiency (%) across array sectors</p>
            </div>
            <button
              onClick={() => onNavigate('panels')}
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-0.5 cursor-pointer"
            >
              Panels <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.arrayPerformance || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="string" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[10, 24]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="efficiency" name="Module Efficiency (%)" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRAPH 3: Temperature Graph (Hourly Ambient vs Panel Cell Temp) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Thermal Monitoring Curve</h3>
              <p className="text-xs text-slate-500">Ambient Temperature vs PV Junction Box Temp (°C)</p>
            </div>
            <button
              onClick={() => onNavigate('weather')}
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-0.5 cursor-pointer"
            >
              Weather <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.hourlyGeneration || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit="°C" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="temp" name="Module Cell Temp (°C)" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="efficiency" name="Array Yield Reference (%)" stroke="#6366f1" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRAPH 4: Daily / Monthly Production Graph */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">7-Day Energy Production (Actual vs Expected)</h3>
              <p className="text-xs text-slate-500">Daily generation in kilowatt-hours (kWh)</p>
            </div>
            <button
              onClick={() => onNavigate('historical')}
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-0.5 cursor-pointer"
            >
              Historical <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.weeklyProduction || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit="kWh" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="actual" name="Actual Yield (kWh)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expected" name="Expected Model (kWh)" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRAPH 5: Monthly Production History */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monthly Energy Production (MWh)</h3>
              <p className="text-xs text-slate-500">6-month trend against designed baseline</p>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-0.5 cursor-pointer"
            >
              Reports <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.monthlyProduction || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit="MWh" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="production" name="Actual Production (MWh)" stroke="#0ea5e9" fill="#e0f2fe" strokeWidth={2} />
                <Area type="monotone" dataKey="baseline" name="Baseline (MWh)" stroke="#94a3b8" fill="#f8fafc" strokeWidth={1.5} strokeDasharray="3 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRAPH 6: Fault Trend Graph */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Fault Incident Trend by Severity</h3>
              <p className="text-xs text-slate-500">Historical critical, high, and medium events</p>
            </div>
            <button
              onClick={() => onNavigate('alerts')}
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-0.5 cursor-pointer"
            >
              Alerts <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.faultTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="critical" name="Critical Severity" fill="#e11d48" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="high" name="High Severity" fill="#f97316" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="medium" name="Medium Severity" fill="#eab308" stackId="a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION: Quick Tables for Active Alerts & Pending Maintenance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Alerts Quick Glance */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Active Threshold Alerts</h3>
                <p className="text-xs text-slate-500">Unresolved anomalies requiring operator action</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('alerts')}
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
            >
              View All ({activeAlerts.length}) <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {activeAlerts.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                All systems healthy. No active threshold alerts.
              </div>
            ) : (
              activeAlerts.map(alert => (
                <div
                  key={alert._id}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={alert.severity} size="sm" />
                      <span className="text-xs font-mono font-bold text-slate-900">{alert.deviceId}</span>
                      <span className="text-[11px] text-slate-400">• {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs text-slate-700 line-clamp-1">{alert.message}</p>
                  </div>

                  <button
                    onClick={() => handleResolveAlert(alert._id)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
                  >
                    Mark Resolved
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Maintenance Quick Glance */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Scheduled Maintenance</h3>
                <p className="text-xs text-slate-500">Upcoming preventative and corrective activities</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('maintenance')}
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
            >
              Maintenance Hub <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {pendingMaintenance.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No maintenance tasks scheduled.
              </div>
            ) : (
              pendingMaintenance.map(task => (
                <div
                  key={task._id}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={task.priority} size="sm" />
                      <span className="text-xs font-mono font-bold text-slate-900">{task.deviceId}</span>
                      <span className="text-[11px] text-slate-500 font-mono">Date: {task.scheduledDate}</span>
                    </div>
                    <p className="text-xs text-slate-700 line-clamp-1">{task.problem}</p>
                    <div className="text-[11px] text-slate-500">Tech: {task.technician}</div>
                  </div>

                  <button
                    onClick={() => onNavigate('maintenance')}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
                  >
                    View Ticket
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
