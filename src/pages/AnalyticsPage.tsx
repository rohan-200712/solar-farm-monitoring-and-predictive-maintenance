import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../services/api.js';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  Calendar,
  Zap,
  TrendingUp,
  BarChart3,
  Gauge,
  Sun,
  Download,
  Filter,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'today' | '7days' | '30days' | 'custom'>('7days');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async (range: string) => {
    try {
      setIsLoading(true);
      const res = await analyticsApi.getEnergy({ range });
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(timeRange);
  }, [timeRange]);

  // Scatter correlation data for Irradiance vs Energy Output
  const correlationData = [
    { irradiance: 200, output: 85 },
    { irradiance: 350, output: 145 },
    { irradiance: 420, output: 180 },
    { irradiance: 550, output: 240 },
    { irradiance: 610, output: 275 },
    { irradiance: 720, output: 320 },
    { irradiance: 830, output: 370 },
    { irradiance: 890, output: 395 },
    { irradiance: 940, output: 415 },
    { irradiance: 980, output: 430 },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Advanced Energy Analytics &amp; Yield Modeling
          </h1>
          <p className="text-xs text-slate-500">
            Comparative performance index, irradiance-power correlation, and diurnal capacity utilization
          </p>
        </div>

        {/* Time Filters */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs self-start sm:self-auto">
          {[
            { id: 'today', label: 'Today' },
            { id: '7days', label: 'Last 7 Days' },
            { id: '30days', label: 'Last 30 Days' },
            { id: 'custom', label: 'Custom Range' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTimeRange(t.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                timeRange === t.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Performance Ratio (PR)</span>
            <Gauge className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-600">83.4%</div>
          <p className="text-xs text-slate-500 mt-1">IEC 61724 Global Benchmark: &gt;80% (Grade A)</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Capacity Factor (CF)</span>
            <TrendingUp className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-bold font-mono text-amber-600">26.8%</div>
          <p className="text-xs text-slate-500 mt-1">Reflects high solar insolation in desert zone</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">CO₂ Offset Avoided</span>
            <Zap className="w-5 h-5 text-sky-500" />
          </div>
          <div className="text-3xl font-bold font-mono text-slate-900">48.2 Tons</div>
          <p className="text-xs text-slate-500 mt-1">Equivalent to 1,220 mature trees planted</p>
        </div>
      </div>

      {/* Chart 1: Daily Energy Production Recharts */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Daily Energy Production (Actual vs Theoretical Model)</h3>
            <p className="text-xs text-slate-500">Generation tracking in kilowatt-hours (kWh)</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.production || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit=" kWh" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="generation" name="Actual Generation (kWh)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expected" name="Theoretical Model (kWh)" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Irradiance vs Energy Output Correlation & Panel Efficiency Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Irradiance vs Energy Correlation */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Irradiance vs. Power Output Correlation (R² = 0.982)
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Solar radiation intensity (W/m²) vs instantaneous generated power (kW)
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={correlationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="irradiance" tick={{ fontSize: 11, fill: '#64748b' }} unit=" W" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit=" kW" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="output" name="Generated Farm Power (kW)" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4, fill: '#d97706' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Efficiency Comparison Across 4 Main Strings */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Array String Efficiency Deviation</h3>
          <p className="text-xs text-slate-500 mb-4">
            String A1 through D4 variance against manufacturer warranty curve
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.production || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[15, 23]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="efficiency" name="String Array Average (%)" stroke="#10b981" fill="#ecfdf5" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
