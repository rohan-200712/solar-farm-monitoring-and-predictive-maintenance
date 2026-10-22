import React, { useState, useEffect } from 'react';
import { alertsApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useSocket } from '../context/SocketContext.js';
import { Alert, AlertSeverity, AlertStatus } from '../types/index.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import {
  AlertTriangle,
  CheckCircle2,
  Filter,
  Flame,
  Zap,
  Radio,
  Clock,
  ShieldCheck,
  RefreshCw,
  Search,
} from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const { role } = useAuth();
  const { triggerDemoSpike } = useSocket();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSpiking, setIsSpiking] = useState(false);

  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      const res = await alertsApi.getAll();
      if (res.data.success) {
        setAlerts(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleResolveAlert = async (id: string) => {
    try {
      const res = await alertsApi.update(id, { status: 'Resolved' });
      if (res.data.success) {
        setAlerts(prev => prev.map(a => (a._id === id ? res.data.data : a)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulate = async (type: 'heat' | 'fault') => {
    try {
      setIsSpiking(true);
      await triggerDemoSpike(type === 'heat' ? 'INV-03' : 'PNL-04', type);
      await fetchAlerts();
    } finally {
      setIsSpiking(false);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    const matchesSeverity = severityFilter === 'all' || a.severity.toLowerCase() === severityFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || a.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch =
      a.deviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesStatus && matchesSearch;
  });

  const activeCount = alerts.filter(a => a.status === 'Active').length;
  const criticalCount = alerts.filter(a => a.status === 'Active' && a.severity === 'Critical').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              System Events &amp; Threshold Alerts
            </h1>
            {criticalCount > 0 && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                {criticalCount} Critical Active
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Rule-triggered telemetry thresholds: Temperature (&gt;75°C / &gt;80°C), Low Efficiency (&lt;14%), Phase Imbalance
          </p>
        </div>

        {/* Live Presentation Demo Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSimulate('heat')}
            disabled={isSpiking}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            title="Inject thermal anomaly into telemetry stream"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Simulate Overheat Spike</span>
          </button>
          <button
            onClick={() => handleSimulate('fault')}
            disabled={isSpiking}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            title="Inject bypass diode collapse event"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulate Diode Fault</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            {(['all', 'Active', 'Resolved'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === s ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s === 'all' ? `All (${alerts.length})` : s === 'Active' ? `Active (${activeCount})` : 'Resolved'}
              </button>
            ))}
          </div>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 cursor-pointer"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search device, event type, message..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-amber-500"
          />
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="text-center py-16 text-slate-400 text-xs">Loading alarms and alerts...</div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            No alerts match your current filter parameters.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredAlerts.map(alert => {
              const isActive = alert.status === 'Active';
              return (
                <div
                  key={alert._id}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    isActive ? 'bg-white hover:bg-slate-50/80' : 'bg-slate-50/50 text-slate-500'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${
                        alert.severity === 'Critical'
                          ? 'bg-rose-100 text-rose-700'
                          : alert.severity === 'High'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <AlertTriangle className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-xs">{alert.deviceId}</span>
                        <StatusBadge status={alert.severity} size="sm" />
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                            isActive
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {alert.status}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900">{alert.type}</h4>
                      <p className="text-xs text-slate-600">{alert.message}</p>

                      {alert.resolvedAt && (
                        <div className="text-[11px] text-emerald-600 flex items-center gap-1 mt-1 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Resolved by {alert.resolvedBy || 'Operator'} on {new Date(alert.resolvedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {isActive && (role === 'admin' || role === 'operator') && (
                    <button
                      onClick={() => handleResolveAlert(alert._id)}
                      className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 transition-colors shrink-0 cursor-pointer self-start sm:self-auto shadow-xs"
                    >
                      Acknowledge &amp; Resolve
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
