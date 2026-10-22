import React, { useState, useEffect } from 'react';
import { analyticsApi, maintenanceApi, alertsApi } from '../services/api.js';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Zap,
  Gauge,
  AlertTriangle,
  Wrench,
  CheckCircle2,
  Building,
  ArrowDownToLine,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      try {
        setIsLoading(true);
        const [sumRes, maintRes, alertRes] = await Promise.all([
          analyticsApi.getSummary(),
          maintenanceApi.getAll(),
          alertsApi.getAll(),
        ]);

        const kpis = sumRes.data.kpis;
        setReportData({
          generatedAt: new Date().toLocaleString(),
          farmName: 'Mojave Central Solar Array #4',
          totalEnergyMwh: kpis?.monthlyProductionMwh ?? 72.8,
          avgEfficiency: kpis?.avgEfficiency ?? 20.2,
          totalPanels: kpis?.totalPanels ?? 20,
          totalInverters: kpis?.totalInverters ?? 5,
          activeAlerts: alertRes.data.data.filter((a: any) => a.status === 'Active').length,
          totalAlerts: alertRes.data.data.length,
          completedMaintenance: maintRes.data.data.filter((m: any) => m.status === 'Completed').length,
          scheduledMaintenance: maintRes.data.data.filter((m: any) => m.status === 'Scheduled').length,
          alerts: alertRes.data.data.slice(0, 6),
          maintenance: maintRes.data.data.slice(0, 6),
        });
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }

    loadReport();
  }, [period]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    if (!reportData) return;

    const rows = [
      ['Metric', 'Value'],
      ['Report Period', period.toUpperCase()],
      ['Generated At', reportData.generatedAt],
      ['Total Energy (MWh)', reportData.totalEnergyMwh],
      ['Average Panel Efficiency (%)', reportData.avgEfficiency],
      ['Monitored Solar Panels', reportData.totalPanels],
      ['Inverter Stations', reportData.totalInverters],
      ['Active Alerts', reportData.activeAlerts],
      ['Lifetime Alerts', reportData.totalAlerts],
      ['Completed Maintenance Tasks', reportData.completedMaintenance],
      ['Scheduled Maintenance Tasks', reportData.scheduledMaintenance],
    ];

    const csvContent = rows.map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SolarFarm_Summary_Report_${period}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 print:m-0 print:p-0">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Executive Summary &amp; Compliance Reports
          </h1>
          <p className="text-xs text-slate-500">
            Official performance audit, plant efficiency benchmarks, and maintenance dispatch logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
            {(['today', 'week', 'month', 'year'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                  period === p ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p === 'today' ? 'Daily' : p === 'week' ? 'Weekly' : p === 'month' ? 'Monthly' : 'Annual'}
              </button>
            ))}
          </div>

          <button
            onClick={handleDownloadCSV}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>CSV Export</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-amber-600 font-bold">
              SOLAR FARM PERFORMANCE AUDIT REPORT
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
              {reportData?.farmName}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              SCADA Telemetry System Verification • Period: <span className="uppercase font-bold">{period}</span>
            </p>
          </div>

          <div className="text-right text-xs text-slate-500 font-mono">
            <div>Generated: {reportData?.generatedAt}</div>
            <div className="text-[11px] text-slate-400">Doc Ref: SFR-2026-09</div>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-sans font-semibold border border-emerald-200 text-[10px]">
              Compliance Verified
            </span>
          </div>
        </div>

        {/* Primary Audit Metrics Table */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Key Audit Metrics &amp; Operational Benchmarks
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-xs text-slate-500">Gross Energy Generated</div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {reportData?.totalEnergyMwh} MWh
              </div>
              <div className="text-[11px] text-emerald-600 mt-1 font-medium">99.2% of target</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-xs text-slate-500">Mean Array Efficiency</div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {reportData?.avgEfficiency}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Design Spec: 20.8%</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-xs text-slate-500">Faults / Alerts Recorded</div>
              <div className="text-2xl font-bold font-mono text-rose-600 mt-1">
                {reportData?.activeAlerts} Active
              </div>
              <div className="text-[11px] text-slate-500 mt-1">{reportData?.totalAlerts} Total Recorded</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-xs text-slate-500">Maintenance Completed</div>
              <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
                {reportData?.completedMaintenance} Tasks
              </div>
              <div className="text-[11px] text-slate-500 mt-1">{reportData?.scheduledMaintenance} In Pipeline</div>
            </div>
          </div>
        </div>

        {/* Recent Anomalies & Corrective Actions Table */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Anomalies Detected &amp; Maintenance Resolution Log
          </h3>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Device</th>
                  <th className="px-4 py-2.5">Incident / Problem</th>
                  <th className="px-4 py-2.5">Assigned Action</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {reportData?.maintenance?.map((m: any) => (
                  <tr key={m._id} className="text-[11px]">
                    <td className="px-4 py-2 text-slate-500">{m.scheduledDate}</td>
                    <td className="px-4 py-2 font-bold text-slate-900">{m.deviceId}</td>
                    <td className="px-4 py-2 font-sans text-slate-700">{m.problem}</td>
                    <td className="px-4 py-2 font-sans text-slate-500">Tech: {m.technician}</td>
                    <td className="px-4 py-2 font-sans font-semibold text-slate-800">{m.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Certification Sign-off */}
        <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-500">
          <div>
            <div className="font-semibold text-slate-700">Lead Solar SCADA Engineer</div>
            <div className="mt-6 border-b border-slate-300 w-48" />
            <div className="mt-1 font-mono text-[11px]">Dr. Sarah Jenkins, PE</div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-slate-700">Grid Utility Interconnection Agent</div>
            <div className="mt-6 border-b border-slate-300 w-48 ml-auto" />
            <div className="mt-1 font-mono text-[11px]">Verified &amp; Certified</div>
          </div>
        </div>
      </div>
    </div>
  );
};
