import React, { useState, useEffect } from 'react';
import { readingsApi } from '../services/api.js';
import { SensorReading } from '../types/index.js';
import {
  Download,
  Search,
  Calendar,
  Filter,
  ArrowUpDown,
  FileSpreadsheet,
  RefreshCw,
} from 'lucide-react';

export const HistoricalDataPage: React.FC = () => {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [timeframe, setTimeframe] = useState<'today' | '7days' | '30days' | 'custom'>('7days');
  const [deviceFilter, setDeviceFilter] = useState<'all' | 'panel' | 'inverter'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const fetchReadings = async () => {
    try {
      setIsLoading(true);
      const res = await readingsApi.getAll({ limit: 200 });
      if (res.data.success) {
        setReadings(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, [timeframe]);

  const filtered = readings.filter(r => {
    const matchesDevice = deviceFilter === 'all' || r.deviceType === deviceFilter;
    const matchesSearch = r.deviceId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDevice && matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExportCSV = () => {
    if (filtered.length === 0) return;

    const headers = ['Timestamp', 'Device ID', 'Device Type', 'Voltage (V)', 'Current (A)', 'Power (W)', 'Temperature (°C)', 'Efficiency (%)', 'Irradiance (W/m²)'];
    const rows = filtered.map(r => [
      new Date(r.timestamp).toISOString(),
      r.deviceId,
      r.deviceType,
      r.voltage,
      r.current,
      r.power,
      r.temperature,
      r.efficiency,
      r.irradiance,
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `solar_telemetry_historical_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Historical Sensor Readings Log &amp; SCADA Archives
          </h1>
          <p className="text-xs text-slate-500">
            Complete telemetry database recording voltage, current, power, cell temperature, and GHI
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export to CSV ({filtered.length} Rows)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {/* Timeframe selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            {(['today', '7days', '30days', 'custom'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                  timeframe === t ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'today' ? 'Today' : t === '7days' ? 'Last 7 Days' : t === '30days' ? 'Last 30 Days' : 'Custom'}
              </button>
            ))}
          </div>

          {/* Device Type selector */}
          <select
            value={deviceFilter}
            onChange={e => setDeviceFilter(e.target.value as any)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 cursor-pointer"
          >
            <option value="all">All Devices (Panels &amp; Inverters)</option>
            <option value="panel">Solar Panels Only</option>
            <option value="inverter">Inverters Only</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by device ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-amber-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Device Identifier</th>
                <th className="px-4 py-3">Device Type</th>
                <th className="px-4 py-3">Voltage (V)</th>
                <th className="px-4 py-3">Current (A)</th>
                <th className="px-4 py-3">Power Output</th>
                <th className="px-4 py-3">Efficiency</th>
                <th className="px-4 py-3">Temperature</th>
                <th className="px-4 py-3">GHI Irradiance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400 font-sans">
                    Loading sensor readings archive...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400 font-sans">
                    No historical readings match this filter.
                  </td>
                </tr>
              ) : (
                paginated.map(row => (
                  <tr key={row._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-2.5 text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(row.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 font-bold text-slate-900">{row.deviceId}</td>
                    <td className="px-4 py-2.5 font-sans capitalize text-slate-600">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          row.deviceType === 'inverter'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {row.deviceType}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-700">{row.voltage} V</td>
                    <td className="px-4 py-2.5 text-slate-700">{row.current} A</td>
                    <td className="px-4 py-2.5 font-bold text-amber-600">
                      {row.deviceType === 'inverter' ? `${row.power} kW` : `${row.power} W`}
                    </td>
                    <td className="px-4 py-2.5 text-emerald-600 font-semibold">{row.efficiency}%</td>
                    <td className="px-4 py-2.5 text-rose-600">{row.temperature}°C</td>
                    <td className="px-4 py-2.5 text-slate-600">{row.irradiance} W/m²</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>
            <span className="px-2 font-mono text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
